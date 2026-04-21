import { NotificationsRepository } from "./notifications.repository";
import { CreateNotificationInput } from "./notifications.validation";
import { getIO } from "../../infrastructure/websocket/socket";
import { PreferencesService } from "../preferences/preferences.service";
import {
  parsePagination,
  paginate,
  PaginationQuery,
} from "../../shared/utils/pagination";

export class NotificationsService {
  constructor(
    private readonly repo = new NotificationsRepository(),
    private readonly prefs = new PreferencesService(),
  ) {}

  async getAll(userId: string, query: PaginationQuery & { search?: string; read?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const read = query.read === "true" ? true : query.read === "false" ? false : undefined;
    const { data, total } = await this.repo.findByUser(userId, skip, limit, query.search, read);
    return paginate(data, total, page, limit);
  }

  async delete(id: string, userId: string) {
    return this.repo.softDelete(id, userId);
  }

  async deleteAll(userId: string) {
    return this.repo.softDeleteAll(userId);
  }

  async create(
    data: CreateNotificationInput,
    options: { bypassPrefs?: boolean } = {},
  ) {
    if (!options.bypassPrefs) {
      const userPrefs = await this.prefs.get(data.userId);
      if (!userPrefs.notificationsEnabled) return null;
    }

    const notification = await this.repo.create(data);

    try {
      const io = getIO();
      io.to(`user:${data.userId}`).emit("notification:new", notification);
    } catch (err) {
      console.error("Failed to emit notification:", err);
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    return this.repo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string) {
    return this.repo.markAllAsRead(userId);
  }

  async markChatNotificationsRead(userId: string, roomId: string) {
    return this.repo.markChatNotificationsRead(userId, roomId);
  }
}
