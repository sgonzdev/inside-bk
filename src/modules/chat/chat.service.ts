import { ChatRepository } from "./chat.repository";
import { CreateRoomInput } from "./chat.validation";
import prisma from "../../infrastructure/database/prisma";
import { AppError } from "../../shared/errors/app-error";
import { getIO } from "../../infrastructure/websocket/socket";
import {
  parsePagination,
  paginate,
  PaginationQuery,
} from "../../shared/utils/pagination";
import {
  uploadFile,
  getPresignedUrl,
} from "../../infrastructure/storage/storage";
import { normalizeMime } from "../../shared/middleware/media-upload";
import * as codes from "../../shared/errors/error-codes";
import path from "path";
import crypto from "crypto";
import { NotificationsService } from "../notifications/notifications.service";

export class ChatService {
  constructor(
    private readonly repo = new ChatRepository(),
    private readonly notifications = new NotificationsService(),
  ) {}

  async createRoom(professionalId: string, data: CreateRoomInput) {
    const allParticipants = [
      ...new Set([professionalId, ...data.participantIds]),
    ];

    const others = await prisma.user.findMany({
      where: { id: { in: data.participantIds } },
      select: { id: true, role: true },
    });
    const nonStudents = others.filter((u) => u.role !== "STUDENT");
    if (nonStudents.length)
      throw AppError.badRequest(codes.CHAT_PARTICIPANTS_MUST_BE_STUDENTS);

    if (allParticipants.length === 2 && !data.name) {
      const existing = await this.repo.findDirectRoom(
        allParticipants[0]!,
        allParticipants[1]!,
      );
      if (existing) return existing;
    }

    return this.repo.createRoom(data.name, allParticipants);
  }

  async addParticipant(
    roomId: string,
    professionalId: string,
    targetUserId: string,
  ) {
    const room = await this.repo.findRoomById(roomId);
    if (!room) throw AppError.notFound(codes.NOT_FOUND);

    await this.ensureParticipant(roomId, professionalId);

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });
    if (!target) throw AppError.notFound(codes.USER_NOT_FOUND);
    if (target.role !== "STUDENT")
      throw AppError.badRequest(codes.CHAT_PARTICIPANTS_MUST_BE_STUDENTS);

    const alreadyIn = await this.repo.isParticipant(roomId, targetUserId);
    if (alreadyIn) throw AppError.conflict(codes.CHAT_ALREADY_PARTICIPANT);

    return this.repo.addParticipant(roomId, targetUserId);
  }

  async getRooms(userId: string, query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findRoomsByUser(
      userId,
      skip,
      limit,
      query.search,
    );
    const enriched = data.map((room) => {
      if (room.name) return room;
      const other = room.participants.find((p) => p.userId !== userId);
      const displayName = other
        ? `${other.user.firstName} ${other.user.lastName}`
        : "Chat";
      return { ...room, displayName };
    });
    return paginate(enriched, total, page, limit);
  }

  async getMessages(
    roomId: string,
    userId: string,
    query: Record<string, unknown>,
  ) {
    await this.ensureParticipant(roomId, userId);
    const limit = Math.min(100, Math.max(1, Number(query["limit"]) || 8));
    const dateParam = query["date"]
      ? new Date(query["date"] as string)
      : undefined;
    let skip: number;
    let page: number;

    if (dateParam && !isNaN(dateParam.getTime())) {
      const result = await this.repo.findMessages(roomId, 0, limit, dateParam);
      skip = result.skip;
      page = Math.floor(skip / limit) + 1;
      const enriched = await this.enrichMedia(result.data);
      return {
        ...paginate(enriched, result.total, page, limit),
        anchorDate: dateParam,
      };
    }

    page = Math.max(1, Number(query["page"]) || 1);
    skip = (page - 1) * limit;
    const result = await this.repo.findMessages(roomId, skip, limit);
    const enriched = await this.enrichMedia(result.data);
    return paginate(enriched, result.total, page, limit);
  }

  private async enrichMedia(
    data: Awaited<ReturnType<ChatRepository["findMessages"]>>["data"],
  ) {
    return Promise.all(
      data.map(async (m) => ({
        ...m,
        isFirstOfDay: await this.repo.isFirstMessageOfDay(
          m.id,
          m.roomId,
          m.createdAt,
        ),
        media: await Promise.all(
          (
            m.media as Array<{ storageKey: string; [key: string]: unknown }>
          ).map(async (f) => ({
            ...f,
            url: await getPresignedUrl(f.storageKey),
          })),
        ),
      })),
    );
  }

  async sendMessage(roomId: string, senderId: string, content: string, replyToId?: string) {
    await this.ensureParticipant(roomId, senderId);
    const message = (await this.repo.createMessage(
      roomId,
      senderId,
      content,
      replyToId,
    )) as {
      id: string;
      roomId: string;
      senderId: string;
      content: string;
      createdAt: Date;
      sender: { firstName: string; lastName: string };
      media: unknown[];
      receipts: unknown[];
    };
    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    await this.broadcastMessage(participantIds, senderId, message);
    await this.notifyUnread(
      participantIds,
      senderId,
      roomId,
      message.sender,
      content,
    );
    return message;
  }

  async sendMediaMessage(
    roomId: string,
    senderId: string,
    files: Express.Multer.File[],
    content = "",
    replyToId?: string,
  ) {
    await this.ensureParticipant(roomId, senderId);

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const mime = normalizeMime(file.mimetype);
        const ext = path.extname(file.originalname) || `.${mime.split("/")[1]}`;
        const storageKey = `chat/${roomId}/${crypto.randomUUID()}${ext}`;
        await uploadFile(storageKey, file.buffer, mime);
        return { storageKey, mimeType: mime, size: file.size };
      }),
    );

    const message = (await this.repo.createMediaMessage(
      roomId,
      senderId,
      uploaded,
      content,
      replyToId,
    )) as {
      id: string;
      roomId: string;
      senderId: string;
      content: string;
      createdAt: Date;
      sender: { firstName: string; lastName: string };
      media: Array<{ storageKey: string; [key: string]: unknown }>;
    };
    const enriched = {
      ...message,
      media: await Promise.all(
        message.media.map(async (m) => ({
          ...m,
          url: await getPresignedUrl(m.storageKey),
        })),
      ),
    };

    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    await this.broadcastMessage(participantIds, senderId, enriched);
    await this.notifyUnread(
      participantIds,
      senderId,
      roomId,
      message.sender,
      content || "Archivo multimedia",
    );
    return enriched;
  }

  async markRead(roomId: string, userId: string) {
    await this.ensureParticipant(roomId, userId);
    const count = await this.repo.markRoomRead(roomId, userId);
    if (count > 0) {
      const participantIds = await this.repo.getRoomParticipantIds(roomId);
      await this.broadcast(participantIds, "chat:read", {
        roomId,
        userId,
        readAt: new Date(),
      });
    }
    await this.notifications.markChatNotificationsRead(userId, roomId);
    return { read: count };
  }

  private async ensureParticipant(roomId: string, userId: string) {
    const isParticipant = await this.repo.isParticipant(roomId, userId);
    if (!isParticipant) throw AppError.forbidden(codes.CHAT_NOT_PARTICIPANT);
  }

  private broadcast(participantIds: string[], event: string, payload: unknown) {
    const io = getIO();
    for (const pid of participantIds) io.to(`user:${pid}`).emit(event, payload);
  }

  /**
   * Broadcast a chat:message and auto-detect delivery.
   * For each recipient that has active WebSocket connections,
   * immediately emit chat:delivered back to the sender.
   */
  private async broadcastMessage(
    participantIds: string[],
    senderId: string,
    message: { id: string; roomId: string; [key: string]: unknown },
  ) {
    const io = getIO();
    // Send message to all participants
    for (const pid of participantIds)
      io.to(`user:${pid}`).emit("chat:message", message);

    // Check which recipients are online and confirm delivery
    const recipients = participantIds.filter((pid) => pid !== senderId);
    for (const rid of recipients) {
      const sockets = await io.in(`user:${rid}`).fetchSockets();
      if (sockets.length > 0) {
        io.to(`user:${senderId}`).emit("chat:delivered", {
          messageId: message.id,
          roomId: message.roomId,
          userId: rid,
        });
      }
    }
  }

  private async notifyUnread(
    participantIds: string[],
    senderId: string,
    roomId: string,
    sender: { firstName: string; lastName: string },
    content: string,
  ) {
    const preview = content.length > 60 ? `${content.slice(0, 60)}…` : content;
    const message = JSON.stringify({
      senderId,
      roomId,
      senderName: `${sender.firstName} ${sender.lastName}`,
      preview,
    });
    await Promise.allSettled(
      participantIds
        .filter((id) => id !== senderId)
        .map((userId) =>
          this.notifications.create({
            userId,
            title: "CHAT_NEW_MESSAGE",
            message,
          }),
        ),
    );
  }
}
