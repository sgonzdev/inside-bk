import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { asyncHandler } from "../../shared/utils/async-handler";
import { AppError } from "../../shared/errors/app-error";
import {
  validateMediaFiles,
  validateMediaSize,
  CHAT_LIMITS,
  ALLOWED_AUDIO_TYPES,
  normalizeMime,
} from "../../shared/middleware/media-upload";
import * as codes from "../../shared/errors/error-codes";

const service = new ChatService();

const roomId = (req: Request) => req.params["roomId"] as string;

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await service.createRoom(req.user!.userId, req.body);
  res.status(201).json({ status: "success", data: room });
});

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getRooms(req.user!.userId, req.query);
  res.json({ status: "success", ...result });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getMessages(
    roomId(req),
    req.user!.userId,
    req.query,
  );
  res.json({ status: "success", ...result });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await service.sendMessage(
    roomId(req),
    req.user!.userId,
    req.body.content,
  );
  res.status(201).json({ status: "success", data: message });
});

export const sendMediaMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) throw AppError.badRequest(codes.UPLOAD_NO_FILE);
    validateMediaFiles(files, CHAT_LIMITS);

    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";
    const message = await service.sendMediaMessage(
      roomId(req),
      req.user!.userId,
      files,
      content,
    );
    res.status(201).json({ status: "success", data: message });
  },
);

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.markRead(roomId(req), req.user!.userId);
  res.json({ status: "success", data: result });
});

export const addParticipant = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await service.addParticipant(
      roomId(req),
      req.user!.userId,
      req.body.userId,
    );
    res.status(201).json({ status: "success", data: result });
  },
);

export const sendVoiceNote = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest(codes.UPLOAD_NO_FILE);
    if (!ALLOWED_AUDIO_TYPES.includes(normalizeMime(req.file.mimetype)))
      throw AppError.badRequest(codes.UPLOAD_INVALID_TYPE);
    validateMediaSize(req.file);

    const message = await service.sendMediaMessage(
      roomId(req),
      req.user!.userId,
      [req.file],
    );
    res.status(201).json({ status: "success", data: message });
  },
);
