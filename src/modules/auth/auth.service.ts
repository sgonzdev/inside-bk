import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { TokenType } from ".prisma/client/index";
import { AuthRepository } from "./auth.repository";
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.validation";
import { AppError } from "../../shared/errors/app-error";
import * as codes from "../../shared/errors/error-codes";
import { env } from "../../shared/config/env";
import { Prisma } from "@prisma/client";
import { sendEmailInBackground } from "../../infrastructure/email/email.service";
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

  /**
   * Dos registros simultáneos con el mismo correo (doble envío, reintento por
   * red lenta) chocaban con el índice único de email y devolvían 500.
   * Ahora el segundo se trata como re-registro.
   */
  private async createOrUpdateOnRace(data: RegisterInput, hashedPassword: string) {
    try {
      return await this.repo.create({ ...data, password: hashedPassword });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }
      const existing = await this.repo.findByEmail(data.email);
      if (!existing || existing.emailVerified) {
        throw AppError.conflict(codes.AUTH_EMAIL_EXISTS);
      }
      return this.repo.updateUnverified(existing.id, {
        ...data,
        password: hashedPassword,
      });
    }
  }

  async register(data: RegisterInput) {
    const existing = await this.repo.findByEmail(data.email);

    if (existing?.emailVerified)
      throw AppError.conflict(codes.AUTH_EMAIL_EXISTS);

    // Si la cuenta existe pero no está verificada, el re-registro reemplaza
    // contraseña y datos (antes se conservaban los del primer registro y el
    // usuario recibía 401 al entrar con la contraseña nueva). Solo el dueño del
    // correo puede activarla, y el enlace anterior queda invalidado abajo.
    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const user = existing
      ? await this.repo.updateUnverified(existing.id, {
          ...data,
          password: hashedPassword,
        })
      : await this.createOrUpdateOnRace(data, hashedPassword);

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

    // No se espera al SMTP: el registro ya quedó guardado. Si el correo no
    // llega, el usuario se vuelve a registrar y recibe un enlace nuevo.
    sendEmailInBackground(
      {
        to: user.email,
        subject,
        html: verifyEmailTemplate(
          user.firstName,
          verificationUrl,
          language,
          env.EMAIL_VERIFICATION_EXPIRES_H,
          data.idDocument.slice(-4),
        ),
      },
      "verify-email",
    );

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

    // activateAccount borra también este token (y cualquier otro de verificación)
    const user = await this.activateAccount(record.userId);
    if (!user) throw AppError.badRequest(codes.AUTH_VERIFICATION_TOKEN_INVALID);

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

    // Se avisa que el correo no tiene cuenta en vez de fingir que se envió.
    // Ocultarlo no protegía nada: el registro ya revela si un correo existe
    // (AUTH_EMAIL_EXISTS). El rate limit por correo e IP frena el sondeo masivo.
    if (!user) throw AppError.notFound(codes.AUTH_EMAIL_NOT_REGISTERED);

    // Se envía el enlace de restablecer esté o no verificada la cuenta: el
    // enlace llega al buzón, así que usarlo prueba que el correo es del
    // usuario y resetPassword activa la cuenta si aún no lo estaba. Así un
    // usuario que no recibió (o perdió) el correo de verificación, u olvidó la
    // contraseña con la que se registró, sale del bloqueo en un solo paso.
    await this.repo.deleteVerificationTokensByUser(user.id, TokenType.PASSWORD_RESET);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MIN * 60 * 1000);
    await this.repo.createVerificationToken(token, user.id, TokenType.PASSWORD_RESET, expiresAt);

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    sendEmailInBackground(
      {
        to: data.email,
        subject: "Restablece tu contraseña - InsideOut Expressions",
        html: resetPasswordTemplate(user.firstName, resetUrl, "ES", env.PASSWORD_RESET_EXPIRES_MIN),
      },
      "reset-password",
    );
  }

  async resetPassword(data: ResetPasswordInput) {
    const record = await this.repo.findVerificationToken(data.token, TokenType.PASSWORD_RESET);

    if (!record || record.expiresAt < new Date()) {
      if (record) await this.repo.deleteVerificationToken(record.id);
      throw AppError.badRequest(codes.AUTH_RESET_TOKEN_INVALID);
    }

    const current = await this.repo.findPasswordHash(record.userId);
    // En una cuenta sin activar no se bloquea reusar la contraseña: puede ser
    // justo la que el usuario eligió al registrarse y solo quiere entrar.
    if (
      current?.emailVerified &&
      (await bcrypt.compare(data.password, current.password))
    ) {
      throw AppError.badRequest(codes.AUTH_PASSWORD_SAME_AS_CURRENT);
    }

    const hashed = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    await Promise.all([
      this.repo.updatePassword(record.userId, hashed),
      this.repo.deleteVerificationToken(record.id),
      this.repo.deleteAllUserRefreshTokens(record.userId),
    ]);

    if (current && !current.emailVerified) {
      await this.activateAccount(record.userId);
    }
  }

  /**
   * Marca el correo como verificado y crea lo que una cuenta activa necesita
   * (salas de chat del estudiante con cada profesional). Lo usan la
   * verificación de correo y el restablecimiento de contraseña.
   */
  private async activateAccount(userId: string) {
    await this.repo.markEmailVerified(userId);
    await this.repo.deleteVerificationTokensByUser(userId, TokenType.EMAIL_VERIFICATION);

    const user = await this.repo.findById(userId);
    if (user?.role === "STUDENT") {
      const professionals = await this.repo.findAllProfessionals();
      if (professionals.length) {
        await this.repo.createChatRoomsForStudent(
          user.id,
          professionals.map((p) => p.id),
        );
      }
    }
    return user;
  }
}
