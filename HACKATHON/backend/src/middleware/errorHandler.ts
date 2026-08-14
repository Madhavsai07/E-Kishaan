import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route: ${req.method} ${req.originalUrl}` },
  });
}

/** Consistent { success: false, error: { code, message } } shape for every error, mapping known error types to the right status/code. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong. Please try again.';

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map((e) => e.message).join('; ');
  } else if (err && typeof err === 'object' && 'code' in err && (err as { code: unknown }).code === 11000) {
    // MongoDB duplicate key error (e.g. email already registered)
    status = 409;
    code = 'DUPLICATE';
    message = 'A record with that value already exists.';
  } else if (err instanceof Error) {
    message = env.NODE_ENV === 'production' ? message : err.message;
  }

  if (status >= 500) {
    logger.error(err instanceof Error ? err.stack || err.message : String(err));
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${status} ${code}: ${message}`);
  }

  res.status(status).json({ success: false, error: { code, message } });
}
