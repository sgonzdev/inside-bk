import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { notificationParamsSchema } from "./notifications.validation";
import * as controller from "./notifications.controller";

const router = Router();

router.use(authenticate);
router.get("/", controller.getAll);
router.patch("/read-all", controller.markAllAsRead);
router.delete("/", controller.deleteAllNotifications);
router.patch(
  "/:id/read",
  validate(notificationParamsSchema, "params"),
  controller.markAsRead,
);
router.delete(
  "/:id",
  validate(notificationParamsSchema, "params"),
  controller.deleteNotification,
);

export default router;
