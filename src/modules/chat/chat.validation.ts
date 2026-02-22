import { z } from "zod";
import * as codes from "../../shared/errors/error-codes";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(100, codes.CHAT_NAME_TOO_LONG)
    .optional(),
  participantIds: z
    .array(z.string().uuid(codes.VALIDATION_ERROR))
    .min(1, codes.FIELD_REQUIRED)
    .max(50, codes.CHAT_TOO_MANY_PARTICIPANTS),
});

export const addParticipantSchema = z.object({
  userId: z.string().uuid(codes.VALIDATION_ERROR),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, codes.FIELD_REQUIRED)
    .max(2000, codes.CHAT_MESSAGE_TOO_LONG),
});

export const roomParamsSchema = z.object({
  roomId: z.string().uuid(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
