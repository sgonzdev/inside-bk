import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import * as codes from "../errors/error-codes";
import prisma from "../../infrastructure/database/prisma";

export interface AuthPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("AUTH_INVALID_TOKEN");
  }

  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized("AUTH_INVALID_TOKEN");
  }
}

export function requireActive(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  prisma.user
    .findUnique({
      where: { id: req.user!.userId },
      select: { emailVerified: true, consentGiven: true, role: true },
    })
    .then((user) => {
      if (!user) return next(AppError.unauthorized(codes.AUTH_INVALID_TOKEN));
      if (!user.emailVerified)
        return next(AppError.forbidden(codes.AUTH_EMAIL_NOT_VERIFIED));
      if (user.role === "STUDENT" && !user.consentGiven)
        return next(AppError.forbidden(codes.CONSENT_REQUIRED));
      next();
    })
    .catch(next);
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw AppError.forbidden("FORBIDDEN");
    }
    next();
  };
}
