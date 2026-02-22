import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { AppError } from '../../shared/errors/app-error';
import {
  validateMediaSize,
  normalizeMime,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  DIARY_LIMITS,
} from '../../shared/middleware/media-upload';
import { uploadFile, deleteFile, getPresignedUrl } from '../../infrastructure/storage/storage';
import * as codes from '../../shared/errors/error-codes';
import prisma from '../../infrastructure/database/prisma';
import path from 'path';
import crypto from 'crypto';

export const uploadDiaryMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw AppError.badRequest(codes.UPLOAD_NO_FILE);

  const mime = normalizeMime(req.file.mimetype);

  // El diario solo acepta imágenes y videos
  if (!ALLOWED_IMAGE_TYPES.includes(mime) && !ALLOWED_VIDEO_TYPES.includes(mime)) {
    throw AppError.badRequest(codes.UPLOAD_INVALID_TYPE);
  }

  validateMediaSize(req.file);

  const entryId = req.params['id'] as string;
  const userId = req.user!.userId;

  const entry = await prisma.diaryEntry.findFirst({ where: { id: entryId, userId }, select: { id: true } });
  if (!entry) throw AppError.notFound(codes.DIARY_NOT_FOUND);

  const existing = await prisma.diaryMedia.findMany({ where: { entryId }, select: { mimeType: true } });
  const imageCount = existing.filter((m) => ALLOWED_IMAGE_TYPES.includes(m.mimeType)).length;
  const videoCount = existing.filter((m) => ALLOWED_VIDEO_TYPES.includes(m.mimeType)).length;

  if (ALLOWED_IMAGE_TYPES.includes(mime) && imageCount >= DIARY_LIMITS.images) throw AppError.badRequest(codes.UPLOAD_TOO_MANY_FILES);
  if (ALLOWED_VIDEO_TYPES.includes(mime) && videoCount >= DIARY_LIMITS.videos) throw AppError.badRequest(codes.UPLOAD_TOO_MANY_FILES);

  const ext = path.extname(req.file.originalname) || `.${mime.split('/')[1]}`;
  const storageKey = `diary/${userId}/${entryId}/${crypto.randomUUID()}${ext}`;

  await uploadFile(storageKey, req.file.buffer, mime);

  const media = await prisma.diaryMedia.create({
    data: { entryId, storageKey, mimeType: mime, size: req.file.size },
  });

  const url = await getPresignedUrl(storageKey);
  res.status(201).json({ status: 'success', data: { ...media, url } });
});

export const deleteDiaryMedia = asyncHandler(async (req: Request, res: Response) => {
  const entryId = req.params['id'] as string;
  const mediaId = req.params['mediaId'] as string;
  const userId = req.user!.userId;

  const media = await prisma.diaryMedia.findFirst({
    where: { id: mediaId, entry: { id: entryId, userId } },
  });
  if (!media) throw AppError.notFound(codes.NOT_FOUND);

  await deleteFile(media.storageKey);
  await prisma.diaryMedia.delete({ where: { id: mediaId } });

  res.status(204).send();
});
