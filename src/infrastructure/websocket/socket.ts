import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../database/prisma";
import { env } from "../../shared/config/env";
import { AuthPayload } from "../../shared/middleware/auth";

let io: Server;

async function isParticipant(roomId: string, userId: string): Promise<boolean> {
  const p = await prisma.chatParticipant.findUnique({
    where: { userId_roomId: { userId, roomId } },
  });
  return !!p;
}

async function markRoomRead(roomId: string, userId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId, senderId: { not: userId } },
    select: { id: true },
  });

  if (!messages.length) return;

  await Promise.all(
    messages.map((m) =>
      prisma.messageReadReceipt.upsert({
        where: { messageId_userId: { messageId: m.id, userId } },
        create: { messageId: m.id, userId },
        update: {},
      }),
    ),
  );

  const participants = await prisma.chatParticipant.findMany({
    where: { roomId },
    select: { userId: true },
  });

  for (const p of participants) {
    io.to(`user:${p.userId}`).emit("chat:read", {
      roomId,
      userId,
      readAt: new Date(),
    });
  }
}

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("AUTH_INVALID_TOKEN"));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("AUTH_INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.userId as string;
    socket.join(`user:${userId}`);

    socket.on("chat:open-room", async ({ roomId }: { roomId: string }) => {
      if (!roomId) return;
      try {
        if (!(await isParticipant(roomId, userId))) return;
        await markRoomRead(roomId, userId);
        await prisma.notification.updateMany({
          where: {
            userId,
            read: false,
            deletedAt: null,
            title: "CHAT_NEW_MESSAGE",
            message: { contains: roomId },
          },
          data: { read: true },
        });
      } catch (err) {
        console.error("chat:open-room error", err);
      }
    });

    // Delivery confirmation — recipient confirms they received the message
    socket.on(
      "chat:delivered",
      async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
        if (!messageId || !roomId) return;
        try {
          if (!(await isParticipant(roomId, userId))) return;
          const message = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: { senderId: true },
          });
          if (!message) return;
          // Notify the original sender that their message was delivered
          io.to(`user:${message.senderId}`).emit("chat:delivered", {
            messageId,
            roomId,
            userId,
          });
        } catch (err) {
          console.error("chat:delivered error", err);
        }
      },
    );

    socket.on(
      "chat:typing",
      async ({ roomId, typing }: { roomId: string; typing: boolean }) => {
        if (!roomId) return;
        try {
          if (!(await isParticipant(roomId, userId))) return;
          const participants = await prisma.chatParticipant.findMany({
            where: { roomId, userId: { not: userId } },
            select: { userId: true },
          });
          for (const p of participants) {
            io.to(`user:${p.userId}`).emit("chat:typing", {
              roomId,
              userId,
              typing,
            });
          }
        } catch (err) {
          console.error("chat:typing error", err);
        }
      },
    );

    socket.on("disconnect", () => {});
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("INTERNAL_ERROR");
  return io;
}
