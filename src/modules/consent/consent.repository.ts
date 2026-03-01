import prisma from "../../infrastructure/database/prisma";

export class ConsentRepository {
  async findByUserId(userId: string) {
    return prisma.consent.findUnique({ where: { userId } });
  }

  async create(data: {
    userId: string;
    storageKey: string;
    ip: string;
    guardianName?: string;
    guardianPhone?: string;
  }) {
    return prisma.consent.create({ data });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        birthDate: true,
        idDocument: true,
        program: true,
      },
    });
  }

  async findUserProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        idDocument: true,
        program: true,
        birthDate: true,
      },
    });
  }

  async markUserConsentGiven(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { consentGiven: true },
    });
  }

  async findAllWithUser(skip: number, take: number, search?: string) {
    const where = search
      ? {
          user: {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              {
                idDocument: { contains: search, mode: "insensitive" as const },
              },
            ],
          },
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.consent.findMany({
        where,
        skip,
        take,
        orderBy: { signedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              idDocument: true,
            },
          },
        },
      }),
      prisma.consent.count({ where }),
    ]);
    return { data, total };
  }
}
