import prisma from '../../infrastructure/database/prisma';
import { CreateNotificationInput } from './notifications.validation';

export class NotificationsRepository {
  async findByUser(userId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total };
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
