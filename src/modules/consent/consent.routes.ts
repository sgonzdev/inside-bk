import { Router } from "express";
import { authenticate, authorize } from "../../shared/middleware/auth";
import { validate } from "../../shared/middleware/validate";
import { signConsentSchema } from "./consent.validation";
import * as controller from "./consent.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("STUDENT"),
  validate(signConsentSchema),
  controller.sign,
);
router.get("/signer-info", authenticate, authorize("STUDENT"), controller.getSignerInfo);
router.get("/me", authenticate, authorize("STUDENT"), controller.getMyConsent);
router.get(
  "/",
  authenticate,
  authorize("PROFESSIONAL"),
  controller.getAllConsents,
);

export default router;
