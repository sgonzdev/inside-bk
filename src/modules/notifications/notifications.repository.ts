import prisma from '../../infrastructure/database/prisma';
import { CreateNotificationInput } from './notifications.validation';

export class NotificationsRepository {
  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
