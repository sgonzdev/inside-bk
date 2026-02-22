import { z } from "zod";
import { PROGRAMS } from "../../shared/config/enums";

export const logEmotionSchema = z.object({
  emotionId: z.string().uuid(),
});

export const emotionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const statsQuerySchema = z
  .object({
    program: z.enum(PROGRAMS).optional(),
    ageMin: z.coerce.number().int().min(0).max(120).optional(),
    ageMax: z.coerce.number().int().min(0).max(120).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(
    (d) =>
      d.ageMin === undefined || d.ageMax === undefined || d.ageMin <= d.ageMax,
    { message: "STATS_AGE_RANGE_INVALID", path: ["ageMin"] },
  )
  .refine((d) => d.from === undefined || d.to === undefined || d.from <= d.to, {
    message: "STATS_DATE_RANGE_INVALID",
    path: ["from"],
  });

export type LogEmotionInput = z.infer<typeof logEmotionSchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
