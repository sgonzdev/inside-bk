import multer from 'multer';
import { AppError } from '../../shared/errors/app-error';
import * as codes from '../../shared/errors/error-codes';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(AppError.badRequest(codes.UPLOAD_INVALID_TYPE));
    }
    cb(null, true);
  },
});
