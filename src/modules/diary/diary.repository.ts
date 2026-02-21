import prisma from '../../infrastructure/database/prisma';
import { CreateDiaryInput, UpdateDiaryInput } from './diary.validation';

export class DiaryRepository {
  async findAllByUser(userId: string) {
    return prisma.diaryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    return prisma.diaryEntry.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateDiaryInput) {
    return prisma.diaryEntry.create({ data: { ...data, userId } });
  }

  async update(id: string, userId: string, data: UpdateDiaryInput) {
    return prisma.diaryEntry.updateMany({ where: { id, userId }, data });
  }

  async delete(id: string, userId: string) {
    return prisma.diaryEntry.deleteMany({ where: { id, userId } });
  }
}
