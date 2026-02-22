import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { asyncHandler } from '../../shared/utils/async-handler';

const service = new ChatService();

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await service.createRoom(req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: room });
});

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getRooms(req.user!.userId, req.query);
  res.json({ status: 'success', ...result });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await service.getMessages(req.params.roomId as string, req.user!.userId);
  res.json({ status: 'success', data: messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await service.sendMessage(req.params.roomId as string, req.user!.userId, req.body.content);
  res.status(201).json({ status: 'success', data: message });
});
