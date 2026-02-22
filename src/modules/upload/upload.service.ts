import { randomUUID } from "crypto";
import path from "path";
import { uploadFile, deleteFile } from "../../infrastructure/storage/storage";
import { UsersRepository } from "../users/users.repository";
import { AppError } from "../../shared/errors/app-error";
import * as codes from "../../shared/errors/error-codes";

export class UploadService {
  constructor(private readonly usersRepo = new UsersRepository()) {}

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const ext = path.extname(file.originalname) || ".jpg";
    const key = `avatars/${userId}/${randomUUID()}${ext}`;

    try {
      const publicUrl = await uploadFile(key, file.buffer, file.mimetype);

      const user = await this.usersRepo.findById(userId);
      if (user?.avatarUrl) {
        const oldKey = this.extractKeyFromUrl(user.avatarUrl);
        if (oldKey) await deleteFile(oldKey).catch(() => {});
      }

      const updated = await this.usersRepo.updateAvatarUrl(userId, publicUrl);
      return updated;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(500, codes.UPLOAD_FAILED);
    }
  }

  async removeAvatar(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw AppError.notFound(codes.USER_NOT_FOUND);

    if (user.avatarUrl) {
      const key = this.extractKeyFromUrl(user.avatarUrl);
      if (key) await deleteFile(key).catch(() => {});
    }

    return this.usersRepo.updateAvatarUrl(userId, null);
  }

  private extractKeyFromUrl(url: string): string | null {
    const match = url.match(/\/avatars\/.+$/);
    return match ? match[0].slice(1) : null;
  }
}
