import { z } from 'zod';
import * as codes from '../../shared/errors/error-codes';
import { PROGRAMS, ROLES, LANGUAGES } from '../../shared/config/enums';

export const registerSchema = z.object({
  email: z.string().email(codes.EMAIL_INVALID).refine(
    (e) => e.endsWith('@fet.edu.co'),
    { message: codes.AUTH_INVALID_DOMAIN },
  ),
  password: z
    .string()
    .min(8, codes.PASS_MIN_LENGTH)
    .regex(/[A-Z]/, codes.PASS_UPPERCASE)
    .regex(/[a-z]/, codes.PASS_LOWERCASE)
    .regex(/[0-9]/, codes.PASS_NUMBER)
    .regex(/[^A-Za-z0-9]/, codes.PASS_SPECIAL),
  firstName: z.string().min(1, codes.FIELD_REQUIRED),
  lastName: z.string().min(1, codes.FIELD_REQUIRED),
  role: z.enum(ROLES).default('STUDENT'),
  language: z.enum(LANGUAGES).default('ES'),
  consentGiven: z.literal(true, { message: codes.CONSENT_REQUIRED }),
  program: z.enum(PROGRAMS).optional(),
  birthDate: z.coerce.date().refine(
    (date) => {
      const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 16;
    },
    { message: codes.AGE_MIN_16 },
  ),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
