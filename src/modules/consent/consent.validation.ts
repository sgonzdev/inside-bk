import { z } from "zod";
import * as codes from "../../shared/errors/error-codes";

export const signConsentSchema = z.object({
  signature: z
    .string()
    .regex(
      /^data:image\/(png|jpeg|webp);base64,/,
      codes.CONSENT_INVALID_SIGNATURE,
    )
    .refine(
      (s) => Buffer.byteLength(s, "utf8") <= 500 * 1024,
      codes.CONSENT_SIGNATURE_TOO_LARGE,
    ),
  guardianName: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(100, codes.NAME_INVALID)
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, codes.NAME_INVALID)
    .optional(),
  guardianPhone: z
    .string()
    .regex(/^\d{10}$/, codes.PHONE_INVALID)
    .optional(),
});

export type SignConsentInput = z.infer<typeof signConsentSchema>;
