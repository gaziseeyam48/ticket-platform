import { PAYMENT_STATUS, PaymentStatus } from "../constants";
export type { PaymentStatus };
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../errors/error-codes";

/**
 * Valid state transitions for the payment lifecycle.
 */
export const VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  [PAYMENT_STATUS.PENDING]: [
    PAYMENT_STATUS.SUBMITTED, // Attendee submits transaction ID
    PAYMENT_STATUS.APPROVED,  // Admin directly approves (e.g. manual/cash verification)
    PAYMENT_STATUS.REJECTED,  // Admin rejects
  ],
  [PAYMENT_STATUS.SUBMITTED]: [
    PAYMENT_STATUS.APPROVED,  // Admin verifies and approves payment
    PAYMENT_STATUS.REJECTED,  // Admin rejects invalid transaction
    PAYMENT_STATUS.SUBMITTED, // Attendee updates or corrects transaction ID
  ],
  [PAYMENT_STATUS.REJECTED]: [
    PAYMENT_STATUS.SUBMITTED, // Attendee re-submits corrected transaction ID
  ],
  [PAYMENT_STATUS.APPROVED]: [
    // Terminal state: Once payment is approved and ticket issued, cannot modify payment directly
  ],
};

/**
 * Checks if a transition from fromStatus to toStatus is valid according to business rules.
 */
export function isValidPaymentTransition(
  fromStatus: PaymentStatus | null | undefined,
  toStatus: PaymentStatus
): boolean {
  // If no previous payment status exists, only PENDING or SUBMITTED are allowed initial states
  if (!fromStatus) {
    return toStatus === PAYMENT_STATUS.PENDING || toStatus === PAYMENT_STATUS.SUBMITTED;
  }

  const allowedTransitions = VALID_PAYMENT_TRANSITIONS[fromStatus];
  if (!allowedTransitions) {
    return false;
  }

  return allowedTransitions.includes(toStatus);
}

/**
 * Determines whether an attendee can submit or resubmit a transaction ID.
 */
export function canSubmitTransaction(currentStatus: PaymentStatus | null | undefined): boolean {
  if (!currentStatus) return true;
  // Cannot submit transaction if payment is already approved
  if (currentStatus === PAYMENT_STATUS.APPROVED) return false;
  return true;
}

/**
 * Determines whether an organizer can review (approve or reject) a payment.
 */
export function canReviewPayment(currentStatus: PaymentStatus | null | undefined): boolean {
  if (!currentStatus) return false;
  // Can review if pending, submitted, or rejected
  return currentStatus === PAYMENT_STATUS.SUBMITTED || currentStatus === PAYMENT_STATUS.PENDING;
}

/**
 * Asserts that a payment transition is valid or throws an AppError.
 */
export function assertValidPaymentTransition(
  fromStatus: PaymentStatus | null | undefined,
  toStatus: PaymentStatus
): void {
  if (!isValidPaymentTransition(fromStatus, toStatus)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Invalid payment status transition from ${fromStatus || "NONE"} to ${toStatus}.`
    );
  }
}
