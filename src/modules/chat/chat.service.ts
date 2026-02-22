import { ChatRepository } from './chat.repository';
import { CreateRoomInput } from './chat.validation';
import prisma from '../../infrastructure/database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { getIO } from '../../infrastructure/websocket/socket';
import { parsePagination, paginate, PaginationQuery } from '../../shared/utils/pagination';
import { uploadFile, getPresignedUrl } from '../../infrastructure/storage/storage';
import { normalizeMime } from '../../shared/middleware/media-upload';
import * as codes from '../../shared/errors/error-codes';
import path from 'path';
import crypto from 'crypto';

export class ChatService {
  constructor(private readonly repo = new ChatRepository()) {}

  async createRoom(professionalId: string, data: CreateRoomInput) {
    // El profesional siempre está incluido
    const allParticipants = [...new Set([professionalId, ...data.participantIds])];

    // Verificar que todos los otros participantes sean STUDENT
    const others = await prisma.user.findMany({
      where: { id: { in: data.participantIds } },
      select: { id: true, role: true },
    });
    const nonStudents = others.filter((u) => u.role !== 'STUDENT');
    if (nonStudents.length) throw AppError.badRequest(codes.CHAT_PARTICIPANTS_MUST_BE_STUDENTS);

    // Si es 1 a 1, reutilizar sala existente
    if (allParticipants.length === 2 && !data.name) {
      const existing = await this.repo.findDirectRoom(allParticipants[0]!, allParticipants[1]!);
      if (existing) return existing;
    }

    return this.repo.createRoom(data.name, allParticipants);
  }

  async addParticipant(roomId: string, professionalId: string, targetUserId: string) {
    const room = await this.repo.findRoomById(roomId);
    if (!room) throw AppError.notFound(codes.NOT_FOUND);

    await this.ensureParticipant(roomId, professionalId);

    const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
    if (!target) throw AppError.notFound(codes.USER_NOT_FOUND);
    if (target.role !== 'STUDENT') throw AppError.badRequest(codes.CHAT_PARTICIPANTS_MUST_BE_STUDENTS);

    const alreadyIn = await this.repo.isParticipant(roomId, targetUserId);
    if (alreadyIn) throw AppError.conflict(codes.CHAT_ALREADY_PARTICIPANT);

    return this.repo.addParticipant(roomId, targetUserId);
  }

  async getRooms(userId: string, query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findRoomsByUser(userId, skip, limit, query.search);
    return paginate(data, total, page, limit);
  }

  async getMessages(roomId: string, userId: string, query: Record<string, unknown>) {
    await this.ensureParticipant(roomId, userId);
    const limit = Math.min(100, Math.max(1, Number(query['limit']) || 8));
    const dateParam = query['date'] ? new Date(query['date'] as string) : undefined;
    let skip: number;
    let page: number;

    if (dateParam && !isNaN(dateParam.getTime())) {
      const result = await this.repo.findMessages(roomId, 0, limit, dateParam);
      skip = result.skip;
      page = Math.floor(skip / limit) + 1;
      const enriched = await this.enrichMedia(result.data);
      return { ...paginate(enriched, result.total, page, limit), anchorDate: dateParam };
    }

    page = Math.max(1, Number(query['page']) || 1);
    skip = (page - 1) * limit;
    const result = await this.repo.findMessages(roomId, skip, limit);
    const enriched = await this.enrichMedia(result.data);
    return paginate(enriched, result.total, page, limit);
  }

  private async enrichMedia(data: Awaited<ReturnType<ChatRepository['findMessages']>>['data']) {
    return Promise.all(data.map(async (m) => ({
      ...m,
      isFirstOfDay: await this.repo.isFirstMessageOfDay(m.id, m.roomId, m.createdAt),
      media: await Promise.all(
        (m.media as Array<{ storageKey: string; [key: string]: unknown }>).map(
          async (f) => ({ ...f, url: await getPresignedUrl(f.storageKey) }),
        ),
      ),
    })));
  }

  async sendMessage(roomId: string, senderId: string, content: string) {
    await this.ensureParticipant(roomId, senderId);
    const message = await this.repo.createMessage(roomId, senderId, content);
    await this.emitToRoom(roomId, 'chat:message', message);
    return message;
  }

  async sendMediaMessage(roomId: string, senderId: string, files: Express.Multer.File[], content = '') {
    await this.ensureParticipant(roomId, senderId);

    const uploaded = await Promise.all(files.map(async (file) => {
      const mime = normalizeMime(file.mimetype);
      const ext = path.extname(file.originalname) || `.${mime.split('/')[1]}`;
      const storageKey = `chat/${roomId}/${crypto.randomUUID()}${ext}`;
      await uploadFile(storageKey, file.buffer, mime);
      return { storageKey, mimeType: mime, size: file.size };
    }));

    const message = await this.repo.createMediaMessage(roomId, senderId, uploaded, content);
    const enriched = {
      ...message,
      media: await Promise.all(
        (message.media as Array<{ storageKey: string; [key: string]: unknown }>).map(
          async (m) => ({ ...m, url: await getPresignedUrl(m.storageKey) }),
        ),
      ),
    };

    await this.emitToRoom(roomId, 'chat:message', enriched);
    return enriched;
  }

  async markRead(roomId: string, userId: string) {
    await this.ensureParticipant(roomId, userId);
    const count = await this.repo.markRoomRead(roomId, userId);
    if (count > 0) {
      await this.emitToRoom(roomId, 'chat:read', { roomId, userId, readAt: new Date() });
    }
    return { read: count };
  }

  private async ensureParticipant(roomId: string, userId: string) {
    const isParticipant = await this.repo.isParticipant(roomId, userId);
    if (!isParticipant) throw AppError.forbidden(codes.CHAT_NOT_PARTICIPANT);
  }

  private async emitToRoom(roomId: string, event: string, payload: unknown) {
    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    const io = getIO();
    for (const pid of participantIds) {
      io.to(`user:${pid}`).emit(event, payload);
    }
  }
}
