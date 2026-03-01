import { Router } from "express";
import { validate } from "../../shared/middleware/validate";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import { authenticate } from "../../shared/middleware/auth";
import { authLimiter } from "../../shared/middleware/rate-limiter";
import * as controller from "./auth.controller";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  controller.register,
);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post(
  "/refresh",
  authLimiter,
  validate(refreshSchema),
  controller.refresh,
);
router.post("/logout", authenticate, validate(logoutSchema), controller.logout);
router.get("/verify-email", controller.verifyEmail);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), controller.resetPassword);

export default router;
