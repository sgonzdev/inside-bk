import { Request, Response } from 'express';
import { UploadService } from './upload.service';
import { asyncHandler } from '../../shared/utils/async-handler';
import { AppError } from '../../shared/errors/app-error';
import * as codes from '../../shared/errors/error-codes';

const service = new UploadService();

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw AppError.badRequest(codes.UPLOAD_NO_FILE);

  const user = await service.uploadAvatar(req.user!.userId, req.file);
  res.json({ status: 'success', data: user });
});

export const removeAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = await service.removeAvatar(req.user!.userId);
  res.json({ status: 'success', data: user });
});
