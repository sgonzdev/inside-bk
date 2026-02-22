import { z } from "zod";
import { PROGRAMS } from "../../shared/config/enums";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  program: z.enum(PROGRAMS).optional(),
  birthDate: z.coerce.date().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
