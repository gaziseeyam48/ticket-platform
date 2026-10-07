import type { CheckinResult } from "../constants";

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: ApiErrorPayload;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface VerificationResponse {
  result: CheckinResult;
  message: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    participantName: string;
    participantEmail: string;
    status: string;
    checkedInAt?: string;
    checkedInBy?: string;
  };
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
  };
}
