import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import { AppError } from '../../shared/errors/app-error';
import * as codes from '../../shared/errors/error-codes';
import { env } from '../../shared/config/env';

function parseExpiry(expiry: string): Date {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('INTERNAL_ERROR');

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const ms = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;

  return new Date(Date.now() + value * ms);
}

export class AuthService {
  constructor(private readonly repo = new AuthRepository()) {}

  async register(data: RegisterInput) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict(codes.AUTH_EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const user = await this.repo.create({ ...data, password: hashedPassword });

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
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async login(data: LoginInput) {
    const user = await this.repo.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw AppError.unauthorized(codes.AUTH_INVALID_CREDENTIALS);
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
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { userId: string; role: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string; role: string };
    } catch {
      throw AppError.unauthorized(codes.AUTH_INVALID_TOKEN);
    }

    const stored = await this.repo.findRefreshToken(refreshToken);
    if (!stored) {
      // Token not in DB — possible theft. Revoke all tokens for this user.
      await this.repo.deleteAllUserRefreshTokens(payload.userId);
      throw AppError.unauthorized(codes.AUTH_TOKEN_REUSE);
    }

    // Rotate: delete old token, issue new pair
    await this.repo.deleteRefreshToken(refreshToken);

    const newPayload = { userId: payload.userId, role: payload.role };
    const accessToken = jwt.sign(newPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    const newRefreshToken = jwt.sign(newPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);

    const expiresAt = parseExpiry(env.JWT_REFRESH_EXPIRES_IN);
    await this.repo.saveRefreshToken(newRefreshToken, payload.userId, expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    try {
      await this.repo.deleteRefreshToken(refreshToken);
    } catch {
      // Token already deleted or doesn't exist — no-op
    }
  }
}
