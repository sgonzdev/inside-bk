import prisma from '../../infrastructure/database/prisma';

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
      include: { participants: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
    });

    if (!room) return null;

    const count = await prisma.chatParticipant.count({ where: { roomId: room.id } });
    return count === 2 ? room : null;
  }

  async createRoom(name: string | undefined, participantIds: string[]) {
    return prisma.chatRoom.create({
      data: {
        name,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
      include: { participants: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
    });
  }

  async findRoomsByUser(userId: string, skip: number, take: number, search?: string) {
    const where = {
      participants: { some: { userId } },
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          participants: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.chatRoom.count({ where }),
    ]);
    return { data, total };
  }

  async findMessages(roomId: string, take = 50) {
    return prisma.chatMessage.findMany({
      where: { roomId },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'asc' },
      take,
    });
  }

  async createMessage(roomId: string, senderId: string, content: string) {
    return prisma.chatMessage.create({
      data: { roomId, senderId, content },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async isParticipant(roomId: string, userId: string) {
    const participant = await prisma.chatParticipant.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    return !!participant;
  }

  async getRoomParticipantIds(roomId: string) {
    const participants = await prisma.chatParticipant.findMany({
      where: { roomId },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  }
}
