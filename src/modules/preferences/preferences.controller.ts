import { Request, Response } from "express";
import { PreferencesService } from "./preferences.service";
import { asyncHandler } from "../../shared/utils/async-handler";

const service = new PreferencesService();

export const get = asyncHandler(async (req: Request, res: Response) => {
  const prefs = await service.get(req.user!.userId);
  res.json({ status: "success", data: prefs });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const prefs = await service.update(req.user!.userId, req.body);
  res.json({ status: "success", data: prefs });
});
