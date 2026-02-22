import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { asyncHandler } from '../../shared/utils/async-handler';

const service = new NotificationsService();

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getAll(req.user!.userId, req.query);
  res.json({ status: 'success', ...result });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await service.markAsRead(req.params.id as string, req.user!.userId);
  res.json({ status: 'success' });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await service.markAllAsRead(req.user!.userId);
  res.json({ status: 'success' });
});
