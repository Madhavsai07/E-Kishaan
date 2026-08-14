import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Wraps an async Express handler so any rejected promise reaches the global error middleware instead of hanging the request. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
