import { z } from "zod";
import { PROGRAMS, SEXES, LANGUAGES } from "../../shared/config/enums";
import * as codes from "../../shared/errors/error-codes";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(100, codes.NAME_INVALID)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, codes.NAME_INVALID)
    .optional(),
  lastName: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(100, codes.NAME_INVALID)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, codes.NAME_INVALID)
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, codes.PHONE_INVALID)
    .optional(),
  idDocument: z
    .string()
    .regex(/^\d{5,10}$/, codes.ID_DOCUMENT_INVALID)
    .optional(),
  sex: z.enum(SEXES).optional(),
  language: z.enum(LANGUAGES).optional(),
  program: z.enum(PROGRAMS).optional(),
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
    )
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
