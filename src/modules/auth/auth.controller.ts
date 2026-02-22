import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../shared/utils/async-handler';
import * as codes from '../../shared/errors/error-codes';

const service = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await service.register(req.body);
  res.status(201).json({ status: 'success', data: user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.login(req.body);
  res.json({ status: 'success', data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.refresh(req.body.refreshToken);
  res.json({ status: 'success', data: result });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await service.logout(req.body.refreshToken);
  res.json({ status: 'success' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await service.verifyEmail(req.query.token as string);
  res.json({ status: 'success', code: codes.AUTH_EMAIL_VERIFIED });
});
