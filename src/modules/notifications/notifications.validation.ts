import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
});

export const notificationParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
