import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { RATE_LIMITED } from "../errors/error-codes";

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_GENERAL_WINDOW_MS,
  max: env.RATE_LIMIT_GENERAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", code: RATE_LIMITED },
});

export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", code: RATE_LIMITED },
});
