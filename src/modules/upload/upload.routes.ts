import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth";
import { avatarUpload } from "./upload.validation";
import { uploadAvatar, removeAvatar } from "./upload.controller";

const router = Router();

router.post(
  "/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  uploadAvatar,
);

router.delete("/avatar", authenticate, removeAvatar);

export default router;
