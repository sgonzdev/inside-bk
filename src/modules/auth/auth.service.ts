import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { TokenType } from ".prisma/client/index";
import { AuthRepository } from "./auth.repository";
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.validation";
import { AppError } from "../../shared/errors/app-error";
import * as codes from "../../shared/errors/error-codes";
import { env } from "../../shared/config/env";
import { sendEmail } from "../../infrastructure/email/email.service";
import { verifyEmailTemplate } from "../../infrastructure/email/templates/verify-email.template";
import { resetPasswordTemplate } from "../../infrastructure/email/templates/reset-password.template";

function parseExpiry(expiry: string): Date {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error("INTERNAL_ERROR");

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;

  return new Date(Date.now() + value * ms);
}

export class AuthService {
  constructor(private readonly repo = new AuthRepository()) {}

  async register(data: RegisterInput) {
    const existing = await this.repo.findByEmail(data.email);

    if (existing?.emailVerified)
      throw AppError.conflict(codes.AUTH_EMAIL_EXISTS);

    const user =
      existing ??
      (await this.repo.create({
        ...data,
        password: await bcrypt.hash(data.password, env.BCRYPT_ROUNDS),
      }));

    await this.repo.deleteVerificationTokensByUser(
      user.id,
      TokenType.EMAIL_VERIFICATION,
    );
    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + env.EMAIL_VERIFICATION_EXPIRES_H * 60 * 60 * 1000,
    );
    await this.repo.createVerificationToken(
      token,
      user.id,
      TokenType.EMAIL_VERIFICATION,
      expiresAt,
    );

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const language = data.language ?? "ES";
    const subject =
      language === "EN"
        ? "Verify your email - InsideOut Expressions"
        : "Verifica tu correo - InsideOut Expressions";

    await sendEmail({
      to: user.email,
      subject,
      html: verifyEmailTemplate(
        user.firstName,
        verificationUrl,
        language,
        env.EMAIL_VERIFICATION_EXPIRES_H,
      ),
    });

    return {
      code: codes.AUTH_REGISTER_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async verifyEmail(token: string) {
    const record = await this.repo.findVerificationToken(
      token,
      TokenType.EMAIL_VERIFICATION,
    );

    if (!record || record.expiresAt < new Date()) {
      if (record) await this.repo.deleteVerificationToken(record.id);
      throw AppError.badRequest(codes.AUTH_VERIFICATION_TOKEN_INVALID);
    }

    await this.repo.markEmailVerified(record.userId);
    await this.repo.deleteVerificationToken(record.id);

    const user = await this.repo.findById(record.userId);
    if (!user) throw AppError.badRequest(codes.AUTH_VERIFICATION_TOKEN_INVALID);

    if (user.role === "STUDENT") {
      const professionals = await this.repo.findAllProfessionals();
      if (professionals.length) {
        await this.repo.createChatRoomsForStudent(
          user.id,
          professionals.map((p) => p.id),
        );
      }
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

    const expiresAt = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);
    await this.repo.saveRefreshToken(refreshToken, user.id, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        program: user.program,
        birthDate: user.birthDate,
        idDocument: user.idDocument,
      },
    };
  }

  async login(data: LoginInput, ip: string, userAgent?: string) {
    const user = await this.repo.findByEmail(data.email);

    if (user) {
      const attempt = await this.repo.findLoginAttempt(user.id);
      if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
        throw AppError.locked(codes.AUTH_ACCOUNT_LOCKED);
      }
    }

    const validPassword =
      user && (await bcrypt.compare(data.password, user.password));

    if (!user || !validPassword) {
      if (user) {
        const attempt = await this.repo.findLoginAttempt(user.id);
        const newAttempts = (attempt?.attempts ?? 0) + 1;
        const lockedUntil =
          newAttempts >= env.LOGIN_MAX_ATTEMPTS
            ? new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60 * 1000)
            : null;
        await this.repo.incrementLoginAttempts(user.id, lockedUntil);
      }
      throw AppError.unauthorized(codes.AUTH_INVALID_CREDENTIALS);
    }

    if (!user.emailVerified)
      throw AppError.forbidden(codes.AUTH_EMAIL_NOT_VERIFIED);

    await this.repo.resetLoginAttempts(user.id);
    await this.repo.createLoginHistory(user.id, ip, userAgent);

    const payload = { userId: user.id, role: user.role };
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

    const expiresAt = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);
    await this.repo.saveRefreshToken(refreshToken, user.id, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        consentGiven: user.consentGiven,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { userId: string; role: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        role: string;
      };
    } catch {
      throw AppError.unauthorized(codes.AUTH_INVALID_TOKEN);
    }

    const stored = await this.repo.findRefreshToken(refreshToken);
    if (!stored) {
      await this.repo.deleteAllUserRefreshTokens(payload.userId);
      throw AppError.unauthorized(codes.AUTH_TOKEN_REUSE);
    }

    await this.repo.deleteRefreshToken(refreshToken);

    const newPayload = { userId: payload.userId, role: payload.role };
    const accessToken = jwt.sign(newPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    const newRefreshToken = jwt.sign(newPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

    const expiresAt = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);
    await this.repo.saveRefreshToken(
      newRefreshToken,
      payload.userId,
      expiresAt,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    try {
      await this.repo.deleteRefreshToken(refreshToken);
    } catch (error) {
      console.error("Error deleting refresh token on logout:", error);
    }
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await this.repo.findByEmailForReset(data.email);

    // Respuesta siempre exitosa — no revelar si el email existe
    if (!user || !user.emailVerified) return;

    await this.repo.deleteVerificationTokensByUser(user.id, TokenType.PASSWORD_RESET);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MIN * 60 * 1000);
    await this.repo.createVerificationToken(token, user.id, TokenType.PASSWORD_RESET, expiresAt);

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: data.email,
      subject: "Restablece tu contraseña - InsideOut Expressions",
      html: resetPasswordTemplate(user.firstName, resetUrl, "ES", env.PASSWORD_RESET_EXPIRES_MIN),
    });
  }

  async resetPassword(data: ResetPasswordInput) {
    const record = await this.repo.findVerificationToken(data.token, TokenType.PASSWORD_RESET);

    if (!record || record.expiresAt < new Date()) {
      if (record) await this.repo.deleteVerificationToken(record.id);
      throw AppError.badRequest(codes.AUTH_RESET_TOKEN_INVALID);
    }

    const current = await this.repo.findPasswordHash(record.userId);
    if (current && await bcrypt.compare(data.password, current.password)) {
      throw AppError.badRequest(codes.AUTH_PASSWORD_SAME_AS_CURRENT);
    }

    const hashed = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    await Promise.all([
      this.repo.updatePassword(record.userId, hashed),
      this.repo.deleteVerificationToken(record.id),
      this.repo.deleteAllUserRefreshTokens(record.userId),
    ]);
  }
}
