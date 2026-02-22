import { Router } from "express";
import { authenticate, authorize } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { logEmotionSchema, statsQuerySchema } from "./emotions.validation";
import * as controller from "./emotions.controller";

const router = Router();

router.get("/wheel", controller.getWheel);
router.use(authenticate);
router.post(
  "/log",
  authorize("STUDENT"),
  validate(logEmotionSchema),
  controller.logEmotion,
);
router.get("/history", authorize("STUDENT"), controller.getHistory);
router.get(
  "/stats",
  authorize("PROFESSIONAL"),
  validate(statsQuerySchema, "query"),
  controller.getStats,
);
router.get("/prediction", authorize("STUDENT"), controller.getDailyPrediction);

export default router;
