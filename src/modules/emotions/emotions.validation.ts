import { z } from "zod";
import { PROGRAMS } from "../../shared/config/enums";

export const logEmotionSchema = z.object({
  emotionId: z.string().uuid(),
  intensity: z.number().int().min(1).max(10).default(5),
  note: z.string().optional(),
});

export const emotionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const statsQuerySchema = z.object({
  program: z.enum(PROGRAMS).optional(),
  ageMin: z.coerce.number().int().min(0).optional(),
  ageMax: z.coerce.number().int().min(0).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type LogEmotionInput = z.infer<typeof logEmotionSchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
