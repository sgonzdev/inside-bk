import prisma from '../../infrastructure/database/prisma';
import { LogEmotionInput, StatsQuery } from './emotions.validation';
import { Prisma } from '@prisma/client';

export class EmotionsRepository {
  async findAllEmotions() {
    return prisma.emotion.findMany({
      include: { children: true },
      where: { parentId: null },
    });
  }

  async findEmotionById(id: string) {
    return prisma.emotion.findUnique({ where: { id }, include: { children: true } });
  }

  async createLog(userId: string, data: LogEmotionInput & { aiFeedback?: string }) {
    return prisma.emotionLog.create({
      data: { userId, ...data },
      include: { emotion: true },
    });
  }

  async findLogsByUser(userId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.emotionLog.findMany({ where: { userId }, include: { emotion: true }, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.emotionLog.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  async getStats(query: StatsQuery) {
    const userWhere: Prisma.UserWhereInput = {};

    if (query.program) {
      userWhere.program = query.program;
    }

    if (query.ageMin !== undefined || query.ageMax !== undefined) {
      const now = new Date();
      userWhere.birthDate = {};
      if (query.ageMax !== undefined) {
        const minDate = new Date(now.getFullYear() - query.ageMax - 1, now.getMonth(), now.getDate());
        userWhere.birthDate.gte = minDate;
      }
      if (query.ageMin !== undefined) {
        const maxDate = new Date(now.getFullYear() - query.ageMin, now.getMonth(), now.getDate());
        userWhere.birthDate.lte = maxDate;
      }
    }

    const logWhere: Prisma.EmotionLogWhereInput = {
      user: Object.keys(userWhere).length > 0 ? userWhere : undefined,
    };

    if (query.from || query.to) {
      logWhere.createdAt = {};
      if (query.from) logWhere.createdAt.gte = query.from;
      if (query.to) logWhere.createdAt.lte = query.to;
    }

    const results = await prisma.emotionLog.groupBy({
      by: ['emotionId'],
      where: logWhere,
      _count: { id: true },
    });

    const emotionIds = results.map((r) => r.emotionId);
    const emotions = await prisma.emotion.findMany({
      where: { id: { in: emotionIds } },
      select: { id: true, name: true },
    });

    const emotionMap = new Map(emotions.map((e) => [e.id, e.name]));

    return results.map((r) => ({
      emotionId: r.emotionId,
      emotionName: emotionMap.get(r.emotionId) ?? '',
      count: r._count.id,
    }));
  }
}
