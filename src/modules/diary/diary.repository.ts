import prisma from "../../infrastructure/database/prisma";
import { CreateDiaryInput, UpdateDiaryInput } from "./diary.validation";

export class DiaryRepository {
  async findAllByUser(
    userId: string,
    skip: number,
    take: number,
    search?: string,
  ) {
    const where = {
      userId,
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    };
    const [data, total] = await Promise.all([
      prisma.diaryEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { media: true },
      }),
      prisma.diaryEntry.count({ where }),
    ]);
    return { data, total };
  }

  async findAll(skip: number, take: number, search?: string) {
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            {
              user: {
                email: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      prisma.diaryEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          media: true,
        },
      }),
      prisma.diaryEntry.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string, userId: string) {
    return prisma.diaryEntry.findFirst({
      where: { id, userId },
      include: { media: true },
    });
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
