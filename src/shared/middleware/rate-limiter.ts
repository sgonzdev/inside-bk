import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { env } from "../config/env";
import { RATE_LIMITED } from "../errors/error-codes";
import type { AuthPayload } from "./auth";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const makeStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as any,
    prefix,
  });

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", code: RATE_LIMITED },
} as const;

/*
 * Por qué las llaves no son solo la IP:
 * en la universidad todos los estudiantes salen a internet por la MISMA IP
 * pública. Limitar solo por IP hace que unos pocos agoten el cupo de todos.
 * Por eso se cuenta por usuario (con sesión) o por correo (login/registro),
 * y la IP queda solo como tope amplio contra abuso.
 */

const clientIp = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

const sha = (value: string) =>
  createHash("sha256").update(value).digest("hex").slice(0, 32);

/** userId del access token si es válido; no lanza (eso lo hace authenticate). */
function sessionUserId(req: Request): string | null {
  const cached = (req as Request & { _rlUserId?: string | null })._rlUserId;
  if (cached !== undefined) return cached;

  let userId: string | null = null;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      userId = (jwt.verify(header.slice(7), env.JWT_SECRET) as AuthPayload).userId ?? null;
    } catch {
      userId = null;
    }
  }
  (req as Request & { _rlUserId?: string | null })._rlUserId = userId;
  return userId;
}

/** Todo /api: por usuario si hay sesión, por IP (con cupo alto) si no. */
export const generalLimiter = rateLimit({
  ...common,
  windowMs: env.RATE_LIMIT_GENERAL_WINDOW_MS,
  limit: (req) =>
    sessionUserId(req) ? env.RATE_LIMIT_GENERAL_MAX : env.RATE_LIMIT_GENERAL_ANON_MAX,
  keyGenerator: (req) => {
    const userId = sessionUserId(req);
    return userId ? `u:${userId}` : `ip:${clientIp(req)}`;
  },
  store: makeStore("rl:general:"),
});

/**
 * Login, registro, recuperar/restablecer contraseña: por correo (o por token
 * de restablecimiento). Un estudiante que se equivoca no bloquea a sus
 * compañeros de la misma red.
 */
export const authLimiter = rateLimit({
  ...common,
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  limit: env.RATE_LIMIT_AUTH_MAX,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (email) return `e:${sha(email)}`;
    const token = typeof req.body?.token === "string" ? req.body.token : "";
    if (token) return `t:${sha(token)}`;
    return `ip:${clientIp(req)}`;
  },
  store: makeStore("rl:auth:"),
});

/** Tope amplio por IP para auth: frena a quien prueba cientos de correos. */
export const authIpLimiter = rateLimit({
  ...common,
  windowMs: env.RATE_LIMIT_AUTH_IP_WINDOW_MS,
  limit: env.RATE_LIMIT_AUTH_IP_MAX,
  keyGenerator: (req) => `ip:${clientIp(req)}`,
  store: makeStore("rl:auth-ip:"),
});

/**
 * Refresh de sesión: por refresh token. Antes compartía cupo con el login, y
 * los refresh automáticos de quienes ya estaban dentro dejaban sin cupo a los
 * que intentaban entrar.
 */
export const refreshLimiter = rateLimit({
  ...common,
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  limit: env.RATE_LIMIT_AUTH_MAX,
  keyGenerator: (req) => {
    const token = typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "";
    return token ? `r:${sha(token)}` : `ip:${clientIp(req)}`;
  },
  store: makeStore("rl:refresh:"),
});

/**
 * Endpoints que consumen IA (registro de emoción): 10 por hora POR ESTUDIANTE.
 * Va después de authenticate, así que req.user siempre existe.
 */
export const emotionLogLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) =>
    req.user?.userId ? `u:${req.user.userId}` : `ip:${clientIp(req)}`,
  store: makeStore("rl:emotion-log:"),
});
