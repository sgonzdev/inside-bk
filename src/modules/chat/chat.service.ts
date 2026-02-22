import { ChatRepository } from './chat.repository';
import { CreateRoomInput } from './chat.validation';
import { AppError } from '../../shared/errors/app-error';
import { getIO } from '../../infrastructure/websocket/socket';
import { parsePagination, paginate, PaginationQuery } from '../../shared/utils/pagination';

export class ChatService {
  constructor(private readonly repo = new ChatRepository()) {}

  async createRoom(userId: string, data: CreateRoomInput) {
    const allParticipants = [...new Set([userId, ...data.participantIds])];

    const isDirect = allParticipants.length === 2 && !data.name;
    if (isDirect) {
      const existing = await this.repo.findDirectRoom(allParticipants[0], allParticipants[1]);
      if (existing) return existing;
    }

    return this.repo.createRoom(data.name, allParticipants);
  }

  async getRooms(userId: string, query: PaginationQuery & { search?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const { data, total } = await this.repo.findRoomsByUser(userId, skip, limit, query.search);
    return paginate(data, total, page, limit);
  }

  async getMessages(roomId: string, userId: string) {
    await this.ensureParticipant(roomId, userId);
    return this.repo.findMessages(roomId);
  }

  async sendMessage(roomId: string, senderId: string, content: string) {
    await this.ensureParticipant(roomId, senderId);
    const message = await this.repo.createMessage(roomId, senderId, content);

    const participantIds = await this.repo.getRoomParticipantIds(roomId);
    const io = getIO();
    for (const pid of participantIds) {
      io.to(`user:${pid}`).emit('chat:message', message);
    }

    return message;
  }

  private async ensureParticipant(roomId: string, userId: string) {
    const isParticipant = await this.repo.isParticipant(roomId, userId);
    if (!isParticipant) throw AppError.forbidden('CHAT_NOT_PARTICIPANT');
  }
}
