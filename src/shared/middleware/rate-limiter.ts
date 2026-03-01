import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { env } from "../config/env";
import { RATE_LIMITED } from "../errors/error-codes";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const makeStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as any,
    prefix,
  });

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_GENERAL_WINDOW_MS,
  max: env.RATE_LIMIT_GENERAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:general:"),
  message: { status: "error", code: RATE_LIMITED },
});

export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:auth:"),
  message: { status: "error", code: RATE_LIMITED },
});

/** Strict limiter for AI-consuming endpoints (emotion log). Max 10 per hour. */
export const emotionLogLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore("rl:emotion-log:"),
  message: { status: "error", code: RATE_LIMITED },
});
