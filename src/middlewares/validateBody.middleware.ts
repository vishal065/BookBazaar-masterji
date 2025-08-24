import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

// Generic Zod schema type: parse Input → Output
type Schema<T> = ZodType<T, any, any>;

export function validateBody<T>(schema: Schema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body as unknown);

      req.body = parsed;

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: "Invalid body",
          details: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }
      return next(err);
    }
  };
}
