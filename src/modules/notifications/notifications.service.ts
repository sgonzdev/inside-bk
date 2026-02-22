import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationInput } from './notifications.validation';
import { getIO } from '../../infrastructure/websocket/socket';
import { PreferencesService } from '../preferences/preferences.service';
import { AppError } from '../../shared/errors/app-error';
import { parsePagination, paginate, PaginationQuery } from '../../shared/utils/pagination';

export class NotificationsService {
  constructor(
    private readonly repo = new NotificationsRepository(),
    private readonly prefs = new PreferencesService(),
  ) {}

  async getAll(userId: string, query: PaginationQuery) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findByUser(userId, skip, limit);
    return paginate(data, total, page, limit);
  }

  async create(data: CreateNotificationInput) {
    const userPrefs = await this.prefs.get(data.userId);
    if (!userPrefs.notificationsEnabled) {
      throw AppError.badRequest('NOTIFICATIONS_DISABLED');
    }

    const notification = await this.repo.create(data);

    try {
      const io = getIO();
      io.to(`user:${data.userId}`).emit('notification:new', notification);
    } catch {
      // Socket not initialized yet - skip real-time push
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    return this.repo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return this.repo.markAllAsRead(userId);
  }
}
