import prisma from "../../infrastructure/database/prisma";
import { CreateNotificationInput } from "./notifications.validation";

export class NotificationsRepository {
  async findByUser(userId: string, skip: number, take: number, search?: string, read?: boolean) {
    const where = {
      userId,
      deletedAt: null,
      ...(read !== undefined ? { read } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { message: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.notification.count({ where }),
    ]);
    return { data, total };
  }

  async softDelete(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteAll(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async markChatNotificationsRead(userId: string, roomId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
        deletedAt: null,
        title: "CHAT_NEW_MESSAGE",
        message: { contains: roomId },
      },
      data: { read: true },
    });
  }

  async create(data: CreateNotificationInput) {
    return prisma.notification.create({ data });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
