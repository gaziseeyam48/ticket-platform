import { describe, it, expect } from "vitest";
import { generateSecureToken, hashToken, generateTicketNumber } from "@/lib/utils/crypto";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES, HTTP_STATUS_MAP } from "@/lib/errors/error-codes";
import { cn } from "@/lib/utils/cn";

describe("Foundation: Crypto Utilities", () => {
  it("should generate cryptographically secure tokens of proper length and entropy", () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toEqual(token2);
    // Base64url without padding for 32 bytes should be ~43-44 chars
    expect(token1.length).toBeGreaterThanOrEqual(42);
    expect(token1).not.toContain("+");
    expect(token1).not.toContain("/");
    expect(token1).not.toContain("=");
  });

  it("should compute deterministic SHA-256 hash for tokens", () => {
    const rawToken = "sample-secure-ticket-token-12345";
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex string is 64 chars
    expect(/^[a-f0-9]{64}$/.test(hash1)).toBe(true);
  });

  it("should generate human-readable ticket identifiers", () => {
    const ticketNum1 = generateTicketNumber();
    const ticketNum2 = generateTicketNumber();

    expect(ticketNum1).toMatch(/^TKT-[2-9A-HJ-NP-Z]{6}$/);
    expect(ticketNum2).toMatch(/^TKT-[2-9A-HJ-NP-Z]{6}$/);
    expect(ticketNum1).not.toEqual(ticketNum2);
  });
});

describe("Foundation: Error Handling", () => {
  it("should instantiate AppError with correct defaults", () => {
    const error = AppError.unauthorized("Please log in");
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(error.statusCode).toBe(HTTP_STATUS_MAP[ERROR_CODES.UNAUTHORIZED]);
    expect(error.message).toBe("Please log in");
    expect(error.isOperational).toBe(true);

    const json = error.toJSON();
    expect(json.code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(json.message).toBe("Please log in");
  });

  it("should correctly serialize custom error details", () => {
    const details = { field: "email", reason: "invalid format" };
    const error = AppError.validation("Validation failed", details);

    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.statusCode).toBe(400);
    expect(error.toJSON()).toEqual({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Validation failed",
      details,
    });
  });
});

describe("Foundation: Styling Helper", () => {
  it("should merge tailwind classes properly", () => {
    const result = cn("px-2 py-1", "bg-red-500", "px-4");
    expect(result).toBe("py-1 bg-red-500 px-4");
  });
});
