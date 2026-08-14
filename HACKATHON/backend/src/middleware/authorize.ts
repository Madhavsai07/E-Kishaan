import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

/** Role gate — use after `authenticate`. `authorize('buyer')` etc. */
export function authorize(...allowedRoles: Array<'farmer' | 'buyer'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden(`This action requires one of these roles: ${allowedRoles.join(', ')}`));
      return;
    }
    next();
  };
}
