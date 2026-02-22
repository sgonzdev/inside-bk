import { z } from "zod";

export const createDiarySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  mood: z.string().optional(),
});

export const updateDiarySchema = createDiarySchema.partial();

export const diaryParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateDiaryInput = z.infer<typeof createDiarySchema>;
export type UpdateDiaryInput = z.infer<typeof updateDiarySchema>;
