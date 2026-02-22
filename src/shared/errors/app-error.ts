import * as codes from './error-codes';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }

  static badRequest(code: string) {
    return new AppError(400, code);
  }

  static unauthorized(code = codes.AUTH_INVALID_CREDENTIALS) {
    return new AppError(401, code);
  }

  static forbidden(code = codes.FORBIDDEN) {
    return new AppError(403, code);
  }

  static notFound(code = codes.NOT_FOUND) {
    return new AppError(404, code);
  }

  static conflict(code: string) {
    return new AppError(409, code);
  }

  static locked(code: string) {
    return new AppError(423, code);
  }
}
