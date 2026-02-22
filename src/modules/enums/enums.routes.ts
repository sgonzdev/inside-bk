import { Router } from "express";
import { PROGRAMS, ROLES, LANGUAGES, THEMES } from "../../shared/config/enums";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "success",
    data: {
      programs: PROGRAMS,
      roles: ROLES,
      languages: LANGUAGES,
      themes: THEMES,
    },
  });
});

export default router;
