import multer from "multer";
import { AppError } from "../errors/app-error";
import * as codes from "../errors/error-codes";

// ── Tipos permitidos ──────────────────────────────────────────
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
export const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/zip",
  "application/x-zip-compressed",
];

const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_DOC_TYPES,
];

/** Normaliza el mimetype quitando parámetros extra (ej: "audio/webm;codecs=opus" → "audio/webm") */
export function normalizeMime(mime: string) {
  return mime.split(";")[0]!.trim();
}

// ── Tamaños máximos ───────────────────────────────────────────
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_DOC_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

// ── Límites de cantidad por módulo ────────────────────────────
export const DIARY_LIMITS = { images: 5, videos: 2, docs: 5 };
export const CHAT_LIMITS = { images: 10, videos: 5, docs: 10 };

// ── Multer ────────────────────────────────────────────────────
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ALLOWED_TYPES.includes(normalizeMime(file.mimetype))) {
    return cb(AppError.badRequest(codes.UPLOAD_INVALID_TYPE));
  }
  cb(null, true);
};

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
  fileFilter,
});

// ── Validaciones ──────────────────────────────────────────────
export function validateMediaSize(file: Express.Multer.File) {
  const mime = normalizeMime(file.mimetype);
  if (ALLOWED_IMAGE_TYPES.includes(mime) && file.size > MAX_IMAGE_SIZE_BYTES)
    throw AppError.badRequest(codes.UPLOAD_TOO_LARGE);
  if (ALLOWED_AUDIO_TYPES.includes(mime) && file.size > MAX_AUDIO_SIZE_BYTES)
    throw AppError.badRequest(codes.UPLOAD_TOO_LARGE);
  if (ALLOWED_DOC_TYPES.includes(mime) && file.size > MAX_DOC_SIZE_BYTES)
    throw AppError.badRequest(codes.UPLOAD_TOO_LARGE);
}

export function validateMediaFiles(
  files: Express.Multer.File[],
  limits: { images: number; videos: number; docs: number },
) {
  const images = files.filter((f) =>
    ALLOWED_IMAGE_TYPES.includes(normalizeMime(f.mimetype)),
  );
  const videos = files.filter((f) =>
    ALLOWED_VIDEO_TYPES.includes(normalizeMime(f.mimetype)),
  );
  const docs = files.filter((f) =>
    ALLOWED_DOC_TYPES.includes(normalizeMime(f.mimetype)),
  );

  if (images.length > limits.images)
    throw AppError.badRequest(codes.UPLOAD_TOO_MANY_FILES);
  if (videos.length > limits.videos)
    throw AppError.badRequest(codes.UPLOAD_TOO_MANY_FILES);
  if (docs.length > limits.docs)
    throw AppError.badRequest(codes.UPLOAD_TOO_MANY_FILES);

  files.forEach(validateMediaSize);
}
