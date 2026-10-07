import { ERROR_CODES, HTTP_STATUS_MAP, type ErrorCode } from "./error-codes";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      statusCode?: number;
      details?: unknown;
      cause?: unknown;
      isOperational?: boolean;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = options?.statusCode ?? HTTP_STATUS_MAP[code] ?? 500;
    this.details = options?.details;
    this.isOperational = options?.isOperational ?? true;

    if (options?.cause) {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(ERROR_CODES.UNAUTHORIZED, message);
  }

  static forbidden(message = "You do not have permission to perform this action"): AppError {
    return new AppError(ERROR_CODES.FORBIDDEN, message);
  }

  static notFound(resource = "Resource"): AppError {
    return new AppError(ERROR_CODES.NOT_FOUND, `${resource} not found`);
  }

  static validation(message: string, details?: unknown): AppError {
    return new AppError(ERROR_CODES.VALIDATION_ERROR, message, { details });
  }

  static duplicate(message: string): AppError {
    return new AppError(ERROR_CODES.DUPLICATE_REGISTRATION, message);
  }

  static invalidState(message: string): AppError {
    return new AppError(ERROR_CODES.INVALID_STATE_TRANSITION, message);
  }

  static internal(message = "An unexpected error occurred", cause?: unknown): AppError {
    return new AppError(ERROR_CODES.INTERNAL_ERROR, message, {
      cause,
      isOperational: false,
    });
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}
