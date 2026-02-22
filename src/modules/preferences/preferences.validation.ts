import { z } from "zod";
import { LANGUAGES, THEMES } from "../../shared/config/enums";

export const updatePreferencesSchema = z.object({
  language: z.enum(LANGUAGES).optional(),
  theme: z.enum(THEMES).optional(),
  notificationsEnabled: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
