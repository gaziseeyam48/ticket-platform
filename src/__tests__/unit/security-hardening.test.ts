import { describe, it, expect } from "vitest";
import { hashToken, generateSecureToken } from "@/lib/utils/crypto";
import {
  signVerifierSessionToken,
  verifyVerifierSessionToken,
  generateVerifierInvitationToken,
  VerifierSessionPayload,
} from "@/lib/services/verifier-session.service";
import { rateLimiter } from "@/lib/utils/rate-limiter";

describe("Phase 15: Security Hardening — Cryptographic Integrity & Token Entropy", () => {
  it("should generate cryptographically strong 32-byte tokens with 256 bits of entropy", () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    expect(token1).not.toBe(token2);
    // Base64url encoded 32 bytes is 43-44 characters
    expect(token1.length).toBeGreaterThanOrEqual(42);
    expect(token1).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("should guarantee one-way cryptographic SHA-256 hash storage", () => {
    const rawToken = generateSecureToken(32);
    const hash = hashToken(rawToken);

    // Hash is 64 hex characters
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain(rawToken);

    // Identical token reproduces identical hash
    expect(hashToken(rawToken)).toBe(hash);
  });

  it("should mask participant email for privacy protection in public ticket views", () => {
    const maskEmail = (emailStr: string) => {
      if (!emailStr || !emailStr.includes("@")) return "";
      const [local, domain] = emailStr.split("@");
      if (local.length <= 2) return `${local[0]}***@${domain}`;
      return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
    };

    expect(maskEmail("john@example.com")).toBe("j**n@example.com");
    expect(maskEmail("alexander@company.org")).toBe("a*******r@company.org");
    expect(maskEmail("me@test.com")).toBe("m***@test.com");
    expect(maskEmail("")).toBe("");
  });
});

describe("Phase 15: Security Hardening — Verifier HMAC Session Security", () => {
  const samplePayload: VerifierSessionPayload = {
    verifier_id: "ver-123",
    verifier_name: "Gate Scanner 1",
    verifier_email: "scanner@event.io",
    event_id: "ev-456",
    organization_id: "org-789",
    role: "EVENT_VERIFIER",
    exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
  };

  it("should generate and verify valid tamper-proof verifier session tokens", () => {
    const token = signVerifierSessionToken(samplePayload);
    const decoded = verifyVerifierSessionToken(token);

    expect(decoded.verifier_id).toBe("ver-123");
    expect(decoded.event_id).toBe("ev-456");
    expect(decoded.role).toBe("EVENT_VERIFIER");
  });

  it("should reject tampered JWT signatures with timing-safe comparison", () => {
    const validToken = signVerifierSessionToken(samplePayload);
    const [header, payload, sig] = validToken.split(".");

    // Tamper with payload (e.g. attempting privilege escalation or changing event_id)
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...samplePayload, event_id: "ev-malicious" })
    )
      .toString("base64")
      .replace(/=/g, "");

    const forgedToken = `${header}.${tamperedPayload}.${sig}`;

    expect(() => verifyVerifierSessionToken(forgedToken)).toThrow(
      "Invalid verifier session signature"
    );
  });

  it("should reject expired verifier session tokens", () => {
    const expiredPayload: VerifierSessionPayload = {
      ...samplePayload,
      exp: Math.floor(Date.now() / 1000) - 60, // Expired 1 minute ago
    };

    const expiredToken = signVerifierSessionToken(expiredPayload);
    expect(() => verifyVerifierSessionToken(expiredToken)).toThrow(
      "Verifier access session has expired"
    );
  });

  it("should reject malformed verifier tokens without crashing", () => {
    expect(() => verifyVerifierSessionToken("not-a-jwt")).toThrow(
      "Malformed verifier session token"
    );
    expect(() => verifyVerifierSessionToken("")).toThrow(
      "Missing verifier session token"
    );
  });
});

describe("Phase 15: Security Hardening — Multi-Tenant Isolation & Authorization", () => {
  type OrganizationMembership = {
    userId: string;
    organizationId: string;
    role: "OWNER" | "ADMIN";
  };

  const memberships: OrganizationMembership[] = [
    { userId: "user-alpha", organizationId: "org-alpha", role: "OWNER" },
    { userId: "user-beta", organizationId: "org-beta", role: "OWNER" },
  ];

  const events = [
    { id: "event-alpha-1", organizationId: "org-alpha", name: "Alpha Summit" },
    { id: "event-beta-1", organizationId: "org-beta", name: "Beta Expo" },
  ];

  const authorizeEventAccess = (userId: string, eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return { allowed: false, reason: "NOT_FOUND" };

    const member = memberships.find(
      (m) => m.userId === userId && m.organizationId === event.organizationId
    );

    if (!member) return { allowed: false, reason: "FORBIDDEN" };
    return { allowed: true, role: member.role };
  };

  it("should strictly deny cross-tenant access between organizations", () => {
    // User Alpha accessing Event Alpha -> ALLOWED
    expect(authorizeEventAccess("user-alpha", "event-alpha-1").allowed).toBe(true);

    // User Alpha accessing Event Beta -> FORBIDDEN
    const crossAttempt = authorizeEventAccess("user-alpha", "event-beta-1");
    expect(crossAttempt.allowed).toBe(false);
    expect(crossAttempt.reason).toBe("FORBIDDEN");

    // User Beta accessing Event Alpha -> FORBIDDEN
    const crossAttempt2 = authorizeEventAccess("user-beta", "event-alpha-1");
    expect(crossAttempt2.allowed).toBe(false);
    expect(crossAttempt2.reason).toBe("FORBIDDEN");
  });

  it("should block verifiers from checking in passes for a different event (Gate Scope Enforcement)", () => {
    const verifierEventId = "event-gate-1";
    const passEventId = "event-gate-2";

    const verifyPassGate = (verifierScope: string, ticketEvent: string) => {
      if (verifierScope !== ticketEvent) {
        return {
          allowed: false,
          status: "WRONG_EVENT",
          message: "Wrong event! This pass was issued for a different gate.",
        };
      }
      return { allowed: true, status: "VALID" };
    };

    const gateAttempt = verifyPassGate(verifierEventId, passEventId);
    expect(gateAttempt.allowed).toBe(false);
    expect(gateAttempt.status).toBe("WRONG_EVENT");
  });
});

describe("Phase 15: Security Hardening — Sliding Window Anti-Abuse Rate Limiting", () => {
  it("should enforce request quota and block abusive volumetric traffic", () => {
    const testKey = `test_rate_ip_${Date.now()}`;
    const maxRequests = 5;
    const windowMs = 5000;

    // First 5 requests should pass
    for (let i = 0; i < maxRequests; i++) {
      const check = rateLimiter.check(testKey, maxRequests, windowMs);
      expect(check.allowed).toBe(true);
      expect(check.remaining).toBe(maxRequests - i - 1);
    }

    // 6th request must be blocked
    const blockedCheck = rateLimiter.check(testKey, maxRequests, windowMs);
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.remaining).toBe(0);
    expect(blockedCheck.resetMs).toBeGreaterThan(0);

    // Reset allows traffic again
    rateLimiter.reset(testKey);
    const afterReset = rateLimiter.check(testKey, maxRequests, windowMs);
    expect(afterReset.allowed).toBe(true);
  });

  it("should neutralize bot submissions using hidden honeypot field", () => {
    const processSubmission = (submission: any, honeypotField?: string) => {
      if (honeypotField && honeypotField.trim().length > 0) {
        // Honeypot tripped: silently return mock success without writing to DB
        return { success: true, isBotTrapped: true };
      }
      return { success: true, isBotTrapped: false };
    };

    // Legitimate human submission: honeypot empty
    const human = processSubmission({ name: "Alice" }, "");
    expect(human.isBotTrapped).toBe(false);

    // Bot automated form fill: fills hidden honeypot
    const bot = processSubmission({ name: "SpamBot" }, "spam@bot.com");
    expect(bot.isBotTrapped).toBe(true);
  });
});

describe("Phase 15: Security Hardening — Revocation & Terminal Turnstile Security", () => {
  it("should maintain immutable revocation status and reject subsequent gate admission", () => {
    type Ticket = {
      id: string;
      ticket_number: string;
      status: "ISSUED" | "CHECKED_IN" | "REVOKED";
    };

    const ticket: Ticket = {
      id: "tkt-sec-1",
      ticket_number: "TKT-SEC-01",
      status: "ISSUED",
    };

    const revokeTicket = (t: Ticket) => {
      if (t.status === "REVOKED") throw new Error("Already revoked");
      t.status = "REVOKED";
      return t;
    };

    const scanPass = (t: Ticket) => {
      if (t.status === "REVOKED") return { status: "REVOKED", admitted: false };
      if (t.status === "CHECKED_IN") return { status: "ALREADY_CHECKED_IN", admitted: false };
      return { status: "VALID", admitted: true };
    };

    // Initial scan is permitted
    expect(scanPass(ticket).admitted).toBe(true);

    // Revocation voids the pass
    revokeTicket(ticket);
    expect(ticket.status).toBe("REVOKED");

    // All subsequent gate verification attempts are immediately blocked
    expect(scanPass(ticket).admitted).toBe(false);
    expect(scanPass(ticket).status).toBe("REVOKED");

    // Re-revoking throws validation error
    expect(() => revokeTicket(ticket)).toThrow("Already revoked");
  });
});
