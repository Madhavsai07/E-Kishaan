import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

/** Validates `req.body` against a zod schema, replacing it with the parsed (typed, defaulted) result. */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      next(AppError.badRequest(message));
      return;
    }
    req.body = result.data;
    next();
  };
}
