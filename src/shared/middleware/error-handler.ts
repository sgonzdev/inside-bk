import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../errors/app-error';
import { INTERNAL_ERROR, UPLOAD_TOO_LARGE } from '../errors/error-codes';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
    });
    return;
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ status: 'error', code: UPLOAD_TOO_LARGE });
    return;
  }

  console.error('Unexpected error:', err);

  res.status(500).json({
    status: 'error',
    code: INTERNAL_ERROR,
    ...(env.NODE_ENV !== 'production' && { message: err.message }),
  });
}
