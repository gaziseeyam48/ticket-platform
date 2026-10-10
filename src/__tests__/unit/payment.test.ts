import { describe, it, expect } from "vitest";
import {
  paymentConfigSchema,
  createEventSchema,
  updateEventSchema,
} from "@/lib/validations/event";
import {
  VALID_PAYMENT_TRANSITIONS,
  isValidPaymentTransition,
  canSubmitTransaction,
  canReviewPayment,
  assertValidPaymentTransition,
} from "@/lib/utils/payment-state";
import { PAYMENT_STATUS } from "@/lib/constants";

describe("Phase 7: Payment Configuration Validation", () => {
  it("should validate a complete and valid payment configuration", () => {
    const validConfig = {
      payment_method: "bKash / Bank Transfer",
      account_number: "01700-123456",
      account_name: "Acme Tech Events Ltd.",
      amount: "500",
      currency: "BDT",
      instructions: "Send payment via bKash merchant and enter TrxID below.",
    };

    const result = paymentConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("BDT");
      expect(result.data.amount).toBe("500");
    }
  });

  it("should fail when mandatory banking details are missing", () => {
    const invalidConfigs = [
      {
        // missing payment_method
        account_number: "01700-123456",
        account_name: "Acme Ltd",
        amount: "500",
        currency: "USD",
      },
      {
        // missing account_number
        payment_method: "Bank Transfer",
        account_name: "Acme Ltd",
        amount: "500",
        currency: "USD",
      },
      {
        // missing amount
        payment_method: "Bank Transfer",
        account_number: "01700-123456",
        account_name: "Acme Ltd",
        currency: "USD",
      },
    ];

    for (const config of invalidConfigs) {
      const result = paymentConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    }
  });

  it("should allow FREE event without payment configuration", () => {
    const freeEvent = {
      name: "Open Community Gathering",
      slug: "open-community-2026",
      event_type: "FREE",
    };

    const result = createEventSchema.safeParse(freeEvent);
    expect(result.success).toBe(true);
  });

  it("should require payment configuration when event_type is PAID", () => {
    const paidWithoutConfig = {
      name: "Exclusive Masterclass",
      slug: "exclusive-masterclass",
      event_type: "PAID",
    };

    const result = createEventSchema.safeParse(paidWithoutConfig);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some((i) => i.path.includes("payment_config"))).toBe(true);
    }
  });

  it("should successfully validate PAID event with complete payment_config", () => {
    const paidWithConfig = {
      name: "Exclusive Masterclass",
      slug: "exclusive-masterclass",
      event_type: "PAID",
      payment_config: {
        payment_method: "Nagad",
        account_number: "01800-987654",
        account_name: "Masterclass Team",
        amount: "1500",
        currency: "BDT",
        instructions: "Transfer to personal wallet and provide reference.",
      },
    };

    const result = createEventSchema.safeParse(paidWithConfig);
    expect(result.success).toBe(true);
  });
});

describe("Phase 7: Payment State Machine Transitions", () => {
  it("should permit valid lifecycle transitions", () => {
    // 1. Initial transitions from empty state
    expect(isValidPaymentTransition(null, PAYMENT_STATUS.PENDING)).toBe(true);
    expect(isValidPaymentTransition(null, PAYMENT_STATUS.SUBMITTED)).toBe(true);

    // 2. Participant submits transaction ID
    expect(isValidPaymentTransition(PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUBMITTED)).toBe(true);

    // 3. Organizer approves or rejects submitted payment
    expect(isValidPaymentTransition(PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.APPROVED)).toBe(true);
    expect(isValidPaymentTransition(PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.REJECTED)).toBe(true);

    // 4. Participant resubmits corrected transaction ID after rejection
    expect(isValidPaymentTransition(PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.SUBMITTED)).toBe(true);

    // 5. Direct approval from pending (e.g. cash on desk / verbal agreement)
    expect(isValidPaymentTransition(PAYMENT_STATUS.PENDING, PAYMENT_STATUS.APPROVED)).toBe(true);

    // 6. Resubmission / update of transaction ID while submitted
    expect(isValidPaymentTransition(PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.SUBMITTED)).toBe(true);
  });

  it("should prohibit invalid and forbidden transitions", () => {
    // 1. Cannot transition out of APPROVED (terminal state)
    expect(isValidPaymentTransition(PAYMENT_STATUS.APPROVED, PAYMENT_STATUS.SUBMITTED)).toBe(false);
    expect(isValidPaymentTransition(PAYMENT_STATUS.APPROVED, PAYMENT_STATUS.REJECTED)).toBe(false);
    expect(isValidPaymentTransition(PAYMENT_STATUS.APPROVED, PAYMENT_STATUS.PENDING)).toBe(false);

    // 2. Cannot reject an unsubmitted state directly into approved without review
    expect(isValidPaymentTransition(PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.APPROVED)).toBe(false);

    // 3. Cannot transition to PENDING once past initial registration
    expect(isValidPaymentTransition(PAYMENT_STATUS.SUBMITTED, PAYMENT_STATUS.PENDING)).toBe(false);
    expect(isValidPaymentTransition(PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.PENDING)).toBe(false);
  });

  it("should correctly evaluate participant submission capabilities", () => {
    // Attendees can submit or resubmit while PENDING, SUBMITTED, or REJECTED
    expect(canSubmitTransaction(null)).toBe(true);
    expect(canSubmitTransaction(PAYMENT_STATUS.PENDING)).toBe(true);
    expect(canSubmitTransaction(PAYMENT_STATUS.SUBMITTED)).toBe(true);
    expect(canSubmitTransaction(PAYMENT_STATUS.REJECTED)).toBe(true);

    // Attendees cannot alter transaction once APPROVED
    expect(canSubmitTransaction(PAYMENT_STATUS.APPROVED)).toBe(false);
  });

  it("should correctly evaluate organizer review permissions", () => {
    // Organizers can review SUBMITTED and PENDING payments
    expect(canReviewPayment(PAYMENT_STATUS.SUBMITTED)).toBe(true);
    expect(canReviewPayment(PAYMENT_STATUS.PENDING)).toBe(true);

    // Organizers cannot review terminal or uninitialized payments
    expect(canReviewPayment(PAYMENT_STATUS.APPROVED)).toBe(false);
    expect(canReviewPayment(null)).toBe(false);
  });

  it("should throw an AppError on invalid transition assertions", () => {
    expect(() => {
      assertValidPaymentTransition(PAYMENT_STATUS.APPROVED, PAYMENT_STATUS.SUBMITTED);
    }).toThrow();

    expect(() => {
      assertValidPaymentTransition(PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUBMITTED);
    }).not.toThrow();
  });
});
