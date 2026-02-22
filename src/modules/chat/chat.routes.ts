import { Router } from "express";
import { authenticate, authorize } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { mediaUpload } from "../../shared/middleware/media-upload";
import {
  createRoomSchema,
  sendMessageSchema,
  roomParamsSchema,
  addParticipantSchema,
} from "./chat.validation";
import * as controller from "./chat.controller";
import { mediaUpload as voiceUpload } from "../../shared/middleware/media-upload";

const router = Router();

router.use(authenticate);

router.post(
  "/rooms",
  authorize("PROFESSIONAL"),
  validate(createRoomSchema),
  controller.createRoom,
);
router.post(
  "/rooms/:roomId/participants",
  authorize("PROFESSIONAL"),
  validate(roomParamsSchema, "params"),
  validate(addParticipantSchema),
  controller.addParticipant,
);

router.get("/rooms", controller.getRooms);
router.get(
  "/rooms/:roomId/messages",
  validate(roomParamsSchema, "params"),
  controller.getMessages,
);
router.post(
  "/rooms/:roomId/messages",
  validate(roomParamsSchema, "params"),
  validate(sendMessageSchema),
  controller.sendMessage,
);
router.post(
  "/rooms/:roomId/messages/media",
  validate(roomParamsSchema, "params"),
  mediaUpload.array("files", 10),
  controller.sendMediaMessage,
);
router.post(
  "/rooms/:roomId/messages/voice",
  validate(roomParamsSchema, "params"),
  voiceUpload.single("audio"),
  controller.sendVoiceNote,
);
router.post(
  "/rooms/:roomId/read",
  validate(roomParamsSchema, "params"),
  controller.markRead,
);

export default router;
