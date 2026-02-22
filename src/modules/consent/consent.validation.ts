import { z } from "zod";

export const signConsentSchema = z.object({
  signature: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "CONSENT_INVALID_SIGNATURE")
    .refine(
      (s) => Buffer.byteLength(s, "utf8") <= 500 * 1024,
      "CONSENT_SIGNATURE_TOO_LARGE",
    ),
  guardianName: z.string().min(1).optional(),
  guardianPhone: z.string().min(7).optional(),
});

export type SignConsentInput = z.infer<typeof signConsentSchema>;
