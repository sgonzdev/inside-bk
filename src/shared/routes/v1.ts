import { Router } from "express";
import { authenticate, requireActive } from "../middleware/auth";

import authRoutes from "../../modules/auth/auth.routes";
import consentRoutes from "../../modules/consent/consent.routes";
import enumsRoutes from "../../modules/enums/enums.routes";
import usersRoutes from "../../modules/users/users.routes";
import diaryRoutes from "../../modules/diary/diary.routes";
import emotionsRoutes from "../../modules/emotions/emotions.routes";
import chatRoutes from "../../modules/chat/chat.routes";
import notificationsRoutes from "../../modules/notifications/notifications.routes";
import preferencesRoutes from "../../modules/preferences/preferences.routes";
import uploadRoutes from "../../modules/upload/upload.routes";
import { getWheel } from "../../modules/emotions/emotions.controller";

const router = Router();

// Public / pre-activation routes
router.use("/auth", authRoutes);
router.use("/enums", enumsRoutes);
router.use("/consent", consentRoutes);
router.get("/emotions/wheel", getWheel);

// All routes below require verified email + signed consent
router.use(authenticate, requireActive);
router.use("/users", usersRoutes);
router.use("/diary", diaryRoutes);
router.use("/emotions", emotionsRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/preferences", preferencesRoutes);
router.use("/upload", uploadRoutes);

export default router;
