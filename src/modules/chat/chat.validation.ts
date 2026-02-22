import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().optional(),
  participantIds: z.array(z.string().uuid()).min(1),
});

export const addParticipantSchema = z.object({
  userId: z.string().uuid(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1),
});

export const roomParamsSchema = z.object({
  roomId: z.string().uuid(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
