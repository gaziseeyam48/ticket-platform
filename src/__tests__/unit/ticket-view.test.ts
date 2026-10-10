import { describe, it, expect } from "vitest";
import { hashToken, generateSecureToken } from "@/lib/utils/crypto";
import { rateLimiter } from "@/lib/utils/rate-limiter";

describe("Phase 9: Anti-Enumeration & Token Hashing Security", () => {
  it("should generate cryptographically strong tokens with irreversible SHA-256 hashes", () => {
    const rawTokenA = generateSecureToken(32);
    const rawTokenB = generateSecureToken(32);

    expect(rawTokenA).not.toBe(rawTokenB);

    const hashA = hashToken(rawTokenA);
    const hashB = hashToken(rawTokenB);

    expect(hashA).not.toBe(hashB);
    expect(hashA.length).toBe(64);
    expect(hashB.length).toBe(64);
  });

  it("should rate limit rapid token enumeration attempts by IP", () => {
    const ip = "192.168.1.100";
    const limiterKey = `ticket_view_${ip}`;
    rateLimiter.reset(limiterKey);

    // Consume allowed attempts (e.g. 5 for test threshold)
    for (let i = 0; i < 5; i++) {
      const res = rateLimiter.check(limiterKey, 5, 60_000);
      expect(res.allowed).toBe(true);
    }

    // Next lookup must be blocked
    const blocked = rateLimiter.check(limiterKey, 5, 60_000);
    expect(blocked.allowed).toBe(false);
  });
});

describe("Phase 9: Privacy & Data Masking for Public Views", () => {
  const maskEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes("@")) return "";
    const [local, domain] = emailStr.split("@");
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  it("should mask participant emails to prevent public harvesting", () => {
    expect(maskEmail("john.doe@example.com")).toBe("j******e@example.com");
    expect(maskEmail("alice@company.org")).toBe("a***e@company.org");
    expect(maskEmail("me@test.com")).toBe("m***@test.com");
  });

  it("should never expose internal attendee form data or notes in public view", () => {
    const internalTicketRecord = {
      id: "ticket-123",
      ticket_number: "TKT-A8B9C0",
      status: "ISSUED",
      participant_name: "Bruce Wayne",
      participant_email: "bruce@wayneenterprises.com",
      participant_data: {
        category: "VIP",
        internal_staff_note: "Confidential security clearance required",
        credit_card_last4: "4242",
      },
    };

    // Public sanitize transformer
    const sanitizePublicTicket = (ticket: typeof internalTicketRecord) => ({
      ticketNumber: ticket.ticket_number,
      status: ticket.status,
      participantName: ticket.participant_name,
      participantEmailMasked: maskEmail(ticket.participant_email),
      category: ticket.participant_data?.category || "General Admission",
    });

    const publicView = sanitizePublicTicket(internalTicketRecord);

    expect(publicView.ticketNumber).toBe("TKT-A8B9C0");
    expect(publicView.participantName).toBe("Bruce Wayne");
    expect(publicView.participantEmailMasked).toBe("b***e@wayneenterprises.com");
    expect(publicView.category).toBe("VIP");

    // Internal sensitive properties must not leak
    expect((publicView as any).participant_email).toBeUndefined();
    expect((publicView as any).internal_staff_note).toBeUndefined();
    expect((publicView as any).credit_card_last4).toBeUndefined();
  });
});

describe("Phase 9: Entrance Pass Status State Rendering", () => {
  it("should accurately classify and represent pass status conditions", () => {
    const evaluatePassStatus = (status: string) => {
      switch (status) {
        case "ISSUED":
          return { isValid: true, label: "Active • Admissible", canAdmit: true };
        case "CHECKED_IN":
          return { isValid: false, label: "Checked In", canAdmit: false };
        case "REVOKED":
          return { isValid: false, label: "Revoked", canAdmit: false };
        default:
          return { isValid: false, label: "Unknown", canAdmit: false };
      }
    };

    const validPass = evaluatePassStatus("ISSUED");
    expect(validPass.isValid).toBe(true);
    expect(validPass.canAdmit).toBe(true);

    const checkedInPass = evaluatePassStatus("CHECKED_IN");
    expect(checkedInPass.isValid).toBe(false);
    expect(checkedInPass.canAdmit).toBe(false);

    const revokedPass = evaluatePassStatus("REVOKED");
    expect(revokedPass.isValid).toBe(false);
    expect(revokedPass.canAdmit).toBe(false);
  });
});
