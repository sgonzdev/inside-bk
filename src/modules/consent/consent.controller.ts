import { Request, Response } from "express";
import { ConsentService } from "./consent.service";
import { asyncHandler } from "../../shared/utils/async-handler";

const service = new ConsentService();

export const sign = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const ip =
    (req.headers["x-forwarded-for"] as string) ??
    req.socket.remoteAddress ??
    "unknown";
  await service.sign(userId, req.body, ip);
  res.status(201).json({ status: "success" });
});

export const getMyConsent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await service.getMyConsent(req.user!.userId);
    res.json({ status: "success", data: result });
  },
);

export const getAllConsents = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await service.getAllConsents(
      req.query as { page?: number; limit?: number; search?: string },
    );
    res.json({ status: "success", ...result });
  },
);
