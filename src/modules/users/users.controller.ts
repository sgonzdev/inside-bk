import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { asyncHandler } from '../../shared/utils/async-handler';

const service = new UsersService();

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await service.getProfile(req.user!.userId);
  res.json({ status: 'success', data: user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await service.updateProfile(req.user!.userId, req.body);
  res.json({ status: 'success', data: user });
});
