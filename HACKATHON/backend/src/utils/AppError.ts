/** Typed application error carrying an HTTP status code, thrown from anywhere and caught by errorHandler.ts. */
export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string) {
    return new AppError(message, 400, 'BAD_REQUEST');
  }
  static unauthorized(message = 'Not authenticated') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Not authorized') {
    return new AppError(message, 403, 'FORBIDDEN');
  }
  static notFound(message = 'Not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }
  static conflict(message: string) {
    return new AppError(message, 409, 'CONFLICT');
  }
}
