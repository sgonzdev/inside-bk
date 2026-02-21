import { Request, Response } from 'express';
import { EmotionsService } from './emotions.service';
import { asyncHandler } from '../../shared/utils/async-handler';

const service = new EmotionsService();

export const getWheel = asyncHandler(async (_req: Request, res: Response) => {
  const emotions = await service.getWheel();
  res.json({ status: 'success', data: emotions });
});

export const logEmotion = asyncHandler(async (req: Request, res: Response) => {
  const log = await service.logEmotion(req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: log });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const logs = await service.getHistory(req.user!.userId);
  res.json({ status: 'success', data: logs });
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await service.getStats(req.query);
  res.json({ status: 'success', data: stats });
});
