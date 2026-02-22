import { Router } from "express";
import { PROGRAMS } from "../../shared/config/enums";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "success", data: { programs: PROGRAMS } });
});

export default router;
