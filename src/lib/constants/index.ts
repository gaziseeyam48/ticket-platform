export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  LIVE: "LIVE",
  ENDED: "ENDED",
  CANCELLED: "CANCELLED",
} as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export const EVENT_TYPE = {
  FREE: "FREE",
  PAID: "PAID",
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export const REGISTRATION_STATUS = {
  REGISTERED: "REGISTERED",
  CANCELLED: "CANCELLED",
} as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const TICKET_STATUS = {
  ISSUED: "ISSUED",
  CHECKED_IN: "CHECKED_IN",
  REVOKED: "REVOKED",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const VERIFIER_STATUS = {
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
} as const;

export type VerifierStatus = (typeof VERIFIER_STATUS)[keyof typeof VERIFIER_STATUS];

export const USER_ROLE = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const CHECKIN_RESULT = {
  VALID: "VALID",
  ALREADY_CHECKED_IN: "ALREADY_CHECKED_IN",
  INVALID: "INVALID",
  REVOKED: "REVOKED",
  WRONG_EVENT: "WRONG_EVENT",
  EVENT_NOT_LIVE: "EVENT_NOT_LIVE",
} as const;

export type CheckinResult = (typeof CHECKIN_RESULT)[keyof typeof CHECKIN_RESULT];
