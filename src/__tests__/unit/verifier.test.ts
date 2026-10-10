import { describe, it, expect } from "vitest";
import {
  generateVerifierInvitationToken,
  signVerifierSessionToken,
  verifyVerifierSessionToken,
  VerifierSessionPayload,
} from "@/lib/services/verifier-session.service";
import { buildVerifierInviteEmailHtml } from "@/lib/services/email.service";
import { hashToken } from "@/lib/utils/crypto";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";

describe("Phase 10: Verifier Invitation & Cryptographic Magic Tokens", () => {
  it("should generate a secure high-entropy raw token and consistent SHA-256 hash", () => {
    const { rawToken, tokenHash } = generateVerifierInvitationToken();

    expect(rawToken).toBeDefined();
    expect(typeof rawToken).toBe("string");
    expect(rawToken.length).toBeGreaterThanOrEqual(32); // 32 random bytes encoded

    expect(tokenHash).toBeDefined();
    expect(tokenHash.length).toBe(64);

    // Verifies one-way deterministic hashing
    const manualHash = hashToken(rawToken);
    expect(tokenHash).toBe(manualHash);
  });

  it("should produce unique tokens across multiple invocations", () => {
    const token1 = generateVerifierInvitationToken();
    const token2 = generateVerifierInvitationToken();

    expect(token1.rawToken).not.toBe(token2.rawToken);
    expect(token1.tokenHash).not.toBe(token2.tokenHash);
  });
});

describe("Phase 10: HMAC-SHA256 Verifier Session Signing & Verification", () => {
  const mockPayload: VerifierSessionPayload = {
    verifier_id: "ver-100-alpha",
    verifier_name: "Jordan Lee",
    verifier_email: "jordan@securitygate.org",
    event_id: "ev-summit-2026",
    organization_id: "org-eventcorp-99",
    role: "EVENT_VERIFIER",
    exp: Math.floor(Date.now() / 1000) + 72 * 3600, // 72 hours from now
  };

  it("should sign payload into a tamper-proof 3-part Base64URL JWT string", () => {
    const jwt = signVerifierSessionToken(mockPayload);

    expect(jwt).toBeDefined();
    const parts = jwt.split(".");
    expect(parts.length).toBe(3);

    // Header part
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    expect(header).toEqual({ alg: "HS256", typ: "JWT" });

    // Payload part
    const decodedPayload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    expect(decodedPayload.verifier_id).toBe("ver-100-alpha");
    expect(decodedPayload.event_id).toBe("ev-summit-2026");
  });

  it("should successfully verify and decode an authentic, unexpired session token", () => {
    const token = signVerifierSessionToken(mockPayload);
    const verified = verifyVerifierSessionToken(token);

    expect(verified.verifier_id).toBe(mockPayload.verifier_id);
    expect(verified.verifier_name).toBe(mockPayload.verifier_name);
    expect(verified.verifier_email).toBe(mockPayload.verifier_email);
    expect(verified.event_id).toBe(mockPayload.event_id);
    expect(verified.organization_id).toBe(mockPayload.organization_id);
    expect(verified.role).toBe("EVENT_VERIFIER");
  });

  it("should reject token with a tampered payload", () => {
    const token = signVerifierSessionToken(mockPayload);
    const [header, payload, signature] = token.split(".");

    // Tamper with payload (elevating event scope)
    const tamperedPayloadObj = JSON.parse(Buffer.from(payload, "base64url").toString());
    tamperedPayloadObj.event_id = "ev-unauthorized-vip-gala";
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(tamperedPayloadObj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const tamperedToken = `${header}.${tamperedPayloadB64}.${signature}`;

    expect(() => verifyVerifierSessionToken(tamperedToken)).toThrow(AppError);
    expect(() => verifyVerifierSessionToken(tamperedToken)).toThrow("Invalid verifier session signature.");
  });

  it("should reject token with a forged signature", () => {
    const token = signVerifierSessionToken(mockPayload);
    const [header, payload] = token.split(".");
    const forgedToken = `${header}.${payload}.forged_invalid_signature_xyz123`;

    expect(() => verifyVerifierSessionToken(forgedToken)).toThrow(AppError);
  });

  it("should reject expired verifier session tokens", () => {
    const expiredPayload: VerifierSessionPayload = {
      ...mockPayload,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };

    const expiredToken = signVerifierSessionToken(expiredPayload);

    expect(() => verifyVerifierSessionToken(expiredToken)).toThrow(AppError);
    try {
      verifyVerifierSessionToken(expiredToken);
    } catch (err: any) {
      expect(err.code).toBe(ERROR_CODES.VERIFIER_EXPIRED);
      expect(err.message).toContain("expired");
    }
  });

  it("should reject malformed tokens", () => {
    expect(() => verifyVerifierSessionToken("")).toThrow(AppError);
    expect(() => verifyVerifierSessionToken("not-a-jwt")).toThrow(AppError);
    expect(() => verifyVerifierSessionToken("part1.part2")).toThrow(AppError);
  });
});

describe("Phase 10: Gate Staff Invitation Email Template", () => {
  it("should generate invitation email HTML with magic link and event context", () => {
    const html = buildVerifierInviteEmailHtml({
      to: "sam@gatecrew.org",
      verifierName: "Sam Rivera",
      eventName: "Global AI Summit 2026",
      organizationName: "DevCon Group",
      magicLinkUrl: "https://platform.io/verify/auth?token=raw-token-xyz&event=ev-123",
      expiresInText: "72 hours",
    });

    expect(html).toContain("Sam Rivera");
    expect(html).toContain("Global AI Summit 2026");
    expect(html).toContain("DevCon Group");
    expect(html).toContain("https://platform.io/verify/auth?token=raw-token-xyz&event=ev-123");
    expect(html).toContain("72 hours");
    expect(html).toContain("Open Turnstile Scanner");
    expect(html).toContain("single-click authentication");
  });
});
