import { z } from "zod";
import * as codes from "../../shared/errors/error-codes";
import { PROGRAMS, ROLES, LANGUAGES, SEXES } from "../../shared/config/enums";

export const registerSchema = z.object({
  email: z
    .string()
    .email(codes.EMAIL_INVALID)
    .refine((e) => e.endsWith("@fet.edu.co"), {
      message: codes.AUTH_INVALID_DOMAIN,
    }),
  password: z
    .string()
    .min(8, codes.PASS_MIN_LENGTH)
    .regex(/[A-Z]/, codes.PASS_UPPERCASE)
    .regex(/[a-z]/, codes.PASS_LOWERCASE)
    .regex(/[0-9]/, codes.PASS_NUMBER)
    .regex(/[^A-Za-z0-9]/, codes.PASS_SPECIAL),
  firstName: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(100, codes.NAME_INVALID)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, codes.NAME_INVALID),
  lastName: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(100, codes.NAME_INVALID)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, codes.NAME_INVALID),
  role: z.enum(ROLES).default("STUDENT"),
  language: z.enum(LANGUAGES).default("ES"),
  phone: z
    .string()
    .regex(/^\d{10}$/, codes.PHONE_INVALID)
    .optional(),
  idDocument: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .regex(/^\d{5,10}$/, codes.ID_DOCUMENT_INVALID),
  sex: z.enum(SEXES).optional(),
  program: z.enum(PROGRAMS, { errorMap: () => ({ message: codes.FIELD_REQUIRED }) }),
  birthDate: z.coerce
    .date()
    .refine(
      (date) => {
        const age =
          (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return age <= 120;
      },
      { message: codes.AGE_MAX },
    )
    .refine(
      (date) => {
        const age =
          (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return age >= 16;
      },
      { message: codes.AGE_MIN_16 },
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .email(codes.EMAIL_INVALID)
    .refine((e) => e.endsWith("@fet.edu.co"), {
      message: codes.AUTH_INVALID_DOMAIN,
    }),
  password: z.string().min(1, codes.FIELD_REQUIRED),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, codes.FIELD_REQUIRED),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, codes.FIELD_REQUIRED),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .email(codes.EMAIL_INVALID)
    .refine((e) => e.endsWith("@fet.edu.co"), { message: codes.AUTH_INVALID_DOMAIN }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, codes.FIELD_REQUIRED),
  password: z
    .string()
    .min(8, codes.PASS_MIN_LENGTH)
    .regex(/[A-Z]/, codes.PASS_UPPERCASE)
    .regex(/[a-z]/, codes.PASS_LOWERCASE)
    .regex(/[0-9]/, codes.PASS_NUMBER)
    .regex(/[^A-Za-z0-9]/, codes.PASS_SPECIAL),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
