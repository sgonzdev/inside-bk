import { TokenType } from ".prisma/client/index";
import prisma from "../../infrastructure/database/prisma";
import { RegisterInput } from "./auth.validation";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });
  }

  async create(data: RegisterInput & { password: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        program: data.program,
        birthDate: data.birthDate,
        phone: data.phone,
        idDocument: data.idDocument,
        sex: data.sex,
        preferences: { create: { language: data.language } },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async saveRefreshToken(token: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  }

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async deleteVerificationTokensByUser(userId: string, type: TokenType) {
    return prisma.verificationToken.deleteMany({ where: { userId, type } });
  }

  async createVerificationToken(
    token: string,
    userId: string,
    type: TokenType,
    expiresAt: Date,
  ) {
    return prisma.verificationToken.create({
      data: { token, userId, type, expiresAt },
    });
  }

  async findVerificationToken(token: string, type: TokenType) {
    return prisma.verificationToken.findFirst({ where: { token, type } });
  }

  async deleteVerificationToken(id: string) {
    return prisma.verificationToken.delete({ where: { id } });
  }

  async markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async findLoginAttempt(userId: string) {
    return prisma.loginAttempt.findUnique({ where: { userId } });
  }

  async incrementLoginAttempts(userId: string, lockedUntil: Date | null) {
    return prisma.loginAttempt.upsert({
      where: { userId },
      create: { userId, attempts: 1, lockedUntil },
      update: { attempts: { increment: 1 }, lockedUntil },
    });
  }

  async resetLoginAttempts(userId: string) {
    return prisma.loginAttempt.deleteMany({ where: { userId } });
  }

  async createLoginHistory(userId: string, ip: string, userAgent?: string) {
    return prisma.loginHistory.create({ data: { userId, ip, userAgent } });
  }

  async findLoginHistory(userId: string) {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
}
