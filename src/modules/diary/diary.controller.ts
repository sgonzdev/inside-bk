import { Request, Response } from "express";
import { DiaryService } from "./diary.service";
import { asyncHandler } from "../../shared/utils/async-handler";

const service = new DiaryService();

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getAll(req.user!.userId, req.query);
  res.json({ status: "success", ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const entry = await service.getById(
    req.params.id as string,
    req.user!.userId,
  );
  res.json({ status: "success", data: entry });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const entry = await service.create(req.user!.userId, req.body);
  res.status(201).json({ status: "success", data: entry });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const entry = await service.update(
    req.params.id as string,
    req.user!.userId,
    req.body,
  );
  res.json({ status: "success", data: entry });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await service.delete(req.params.id as string, req.user!.userId);
  res.status(204).send();
});

export const getAllForProfessional = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await service.getAllForProfessional(req.query);
    res.json({ status: "success", ...result });
  },
);
