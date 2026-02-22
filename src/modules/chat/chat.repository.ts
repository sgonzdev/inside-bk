import prisma from "../../infrastructure/database/prisma";

const MESSAGE_INCLUDE = {
  sender: { select: { id: true, firstName: true, lastName: true } },
  media: true,
  receipts: { select: { userId: true, readAt: true } },
} as const;

export class ChatRepository {
  async findDirectRoom(userIdA: string, userIdB: string) {
    const room = await prisma.chatRoom.findFirst({
      where: {
        name: null,
        participants: { every: { userId: { in: [userIdA, userIdB] } } },
        AND: [
          { participants: { some: { userId: userIdA } } },
          { participants: { some: { userId: userIdB } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!room) return null;
    const count = await prisma.chatParticipant.count({
      where: { roomId: room.id },
    });
    return count === 2 ? room : null;
  }

  async createRoom(name: string | undefined, participantIds: string[]) {
    return prisma.chatRoom.create({
      data: {
        name,
        participants: { create: participantIds.map((userId) => ({ userId })) },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findRoomsByUser(
    userId: string,
    skip: number,
    take: number,
    search?: string,
  ) {
    const where = {
      participants: { some: { userId } },
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };
    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          participants: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: MESSAGE_INCLUDE,
          },
        },
      }),
      prisma.chatRoom.count({ where }),
    ]);

    const data = await Promise.all(
      rooms.map(async (room) => {
        const unread = await prisma.chatMessage.count({
          where: {
            roomId: room.id,
            senderId: { not: userId },
            receipts: { none: { userId } },
          },
        });
        return { ...room, unread };
      }),
    );

    return { data, total };
  }

  async findMessages(roomId: string, skip = 0, take = 8, date?: Date) {
    const total = await prisma.chatMessage.count({ where: { roomId } });

    if (date) {
      const countAfter = await prisma.chatMessage.count({
        where: { roomId, createdAt: { gte: date } },
      });
      skip = Math.max(0, countAfter - Math.floor(take / 2));
    }

    const data = await prisma.chatMessage.findMany({
      where: { roomId },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    return { data: data.reverse(), total, skip };
  }

  async createMessage(roomId: string, senderId: string, content: string) {
    return prisma.chatMessage.create({
      data: { roomId, senderId, content },
      include: MESSAGE_INCLUDE,
    });
  }

  async createMediaMessage(
    roomId: string,
    senderId: string,
    files: { storageKey: string; mimeType: string; size: number }[],
    content = "",
  ) {
    return prisma.chatMessage.create({
      data: { roomId, senderId, content, media: { create: files } },
      include: MESSAGE_INCLUDE,
    });
  }

  async markRead(messageId: string, userId: string) {
    return prisma.messageReadReceipt.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: { readAt: new Date() },
    });
  }

  async markRoomRead(roomId: string, userId: string) {
    const messages = await prisma.chatMessage.findMany({
      where: { roomId, senderId: { not: userId } },
      select: { id: true },
    });
    await Promise.all(
      messages.map((m) =>
        prisma.messageReadReceipt.upsert({
          where: { messageId_userId: { messageId: m.id, userId } },
          create: { messageId: m.id, userId },
          update: {},
        }),
      ),
    );
    return messages.length;
  }

  async addParticipant(roomId: string, userId: string) {
    return prisma.chatParticipant.create({ data: { roomId, userId } });
  }

  async isFirstMessageOfDay(
    messageId: string,
    roomId: string,
    createdAt: Date,
  ) {
    const dayStart = new Date(createdAt);
    dayStart.setHours(0, 0, 0, 0);
    const prev = await prisma.chatMessage.findFirst({
      where: {
        roomId,
        createdAt: { gte: dayStart, lt: createdAt },
        id: { not: messageId },
      },
      select: { id: true },
    });
    return prev === null;
  }

  async findRoomById(roomId: string) {
    return prisma.chatRoom.findUnique({ where: { id: roomId } });
  }

  async isParticipant(roomId: string, userId: string) {
    const p = await prisma.chatParticipant.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    return !!p;
  }

  async getRoomParticipantIds(roomId: string) {
    const participants = await prisma.chatParticipant.findMany({
      where: { roomId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  }
}
