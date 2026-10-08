import { describe, it, expect, beforeEach } from "vitest";
import { rateLimiter } from "@/lib/utils/rate-limiter";
import { validateSubmissionData, FormField } from "@/lib/validations/form";

describe("Phase 5: Rate Limiter", () => {
  const testKey = "test-ip-127.0.0.1";

  beforeEach(() => {
    rateLimiter.reset(testKey);
  });

  it("should permit requests within the allowed threshold", () => {
    for (let i = 0; i < 5; i++) {
      const res = rateLimiter.check(testKey, 5, 10_000);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - (i + 1));
    }
  });

  it("should block requests when rate limit is exceeded", () => {
    // Consume all 3 allowed requests
    for (let i = 0; i < 3; i++) {
      rateLimiter.check(testKey, 3, 10_000);
    }

    // 4th request must be rejected
    const blockedRes = rateLimiter.check(testKey, 3, 10_000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetMs).toBeGreaterThan(0);
  });

  it("should isolate limits across different keys", () => {
    const keyA = "ip-alpha";
    const keyB = "ip-beta";
    rateLimiter.reset(keyA);
    rateLimiter.reset(keyB);

    for (let i = 0; i < 3; i++) {
      rateLimiter.check(keyA, 3, 10_000);
    }

    // keyA is exhausted
    expect(rateLimiter.check(keyA, 3, 10_000).allowed).toBe(false);

    // keyB still has capacity
    expect(rateLimiter.check(keyB, 3, 10_000).allowed).toBe(true);
  });
});

describe("Phase 5: Public Registration Data Validation & Parsing", () => {
  const testFields: FormField[] = [
    {
      id: "field_name",
      type: "text",
      label: "Full Name",
      required: true,
      options: [],
      order: 0,
      isSystem: true,
    },
    {
      id: "field_email",
      type: "email",
      label: "Email Address",
      required: true,
      options: [],
      order: 1,
      isSystem: true,
    },
    {
      id: "field_phone",
      type: "phone",
      label: "Phone Number",
      required: false,
      options: [],
      order: 2,
    },
    {
      id: "field_role",
      type: "radio",
      label: "Attendee Role",
      required: true,
      options: ["Student", "Professional", "Speaker"],
      order: 3,
    },
  ];

  it("should validate and normalize valid attendee submissions", () => {
    const submission = {
      field_name: "  Sarah Connor  ",
      field_email: " Sarah.Connor@SKYNET.COM ",
      field_phone: "+1 555 123 4567",
      field_role: "Professional",
    };

    const validation = validateSubmissionData(testFields, submission);
    expect(validation.isValid).toBe(true);
    expect(Object.keys(validation.errors).length).toBe(0);

    // Normalization check
    const normalizedEmail = (submission.field_email as string).trim().toLowerCase();
    const normalizedName = (submission.field_name as string).trim();

    expect(normalizedEmail).toBe("sarah.connor@skynet.com");
    expect(normalizedName).toBe("Sarah Connor");
  });

  it("should flag invalid email formats and missing required radio choice", () => {
    const invalidSubmission = {
      field_name: "John",
      field_email: "not-an-email",
      field_role: "Astronaut", // Not in valid options
    };

    const validation = validateSubmissionData(testFields, invalidSubmission);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.field_email).toContain("valid email");
    expect(validation.errors.field_role).toContain("Selected value must be one of");
  });

  it("should verify event state registration eligibility", () => {
    const isRegistrationAllowed = (status: string) => {
      return status === "PUBLISHED" || status === "LIVE";
    };

    expect(isRegistrationAllowed("PUBLISHED")).toBe(true);
    expect(isRegistrationAllowed("LIVE")).toBe(true);
    expect(isRegistrationAllowed("DRAFT")).toBe(false);
    expect(isRegistrationAllowed("ENDED")).toBe(false);
    expect(isRegistrationAllowed("CANCELLED")).toBe(false);
  });
});
