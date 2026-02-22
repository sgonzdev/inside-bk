import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { VALIDATION_ERROR } from "../errors/error-codes";

export function validate(
  schema: ZodSchema,
  source: "body" | "params" | "query" = "body",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        status: "error",
        code: VALIDATION_ERROR,
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }
    req[source] = result.data;
    next();
  };
}
