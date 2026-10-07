import { NextResponse } from "next/server";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../errors/error-codes";
import type { ApiResponse } from "../types/common.types";

export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      ...(message ? { message } : {}),
    },
    { status }
  );
}

export function apiError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.toJSON(),
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected or native Errors without leaking raw traces
  const isDev = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

  console.error("[Unhandled API Error]:", error);

  return NextResponse.json(
    {
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: isDev ? errorMessage : "An unexpected server error occurred",
      },
    },
    { status: 500 }
  );
}
