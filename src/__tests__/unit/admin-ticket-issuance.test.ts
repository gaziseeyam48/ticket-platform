import { describe, it, expect } from "vitest";
import { generateSecureToken, hashToken, generateTicketNumber } from "@/lib/utils/crypto";
import { buildTicketUrl, generateQrCodeDataUrl } from "@/lib/services/qr.service";

describe("Phase 8: Direct Ticket Issuance Validation & Data Sanitization", () => {
  const validateParticipantInput = (name: string, email: string) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return { valid: false, error: "Participant name must be at least 2 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { valid: false, error: "A valid participant email address is required." };
    }

    return { valid: true, name: trimmedName, email: trimmedEmail };
  };

  it("should validate and normalize valid participant credentials", () => {
    const res = validateParticipantInput("  Marcus Brody  ", " Marcus.Brody@MUSEUM.ORG ");
    expect(res.valid).toBe(true);
    if (res.valid) {
      expect(res.name).toBe("Marcus Brody");
      expect(res.email).toBe("marcus.brody@museum.org");
    }
  });

  it("should reject inputs with insufficient name length", () => {
    expect(validateParticipantInput("A", "valid@example.com").valid).toBe(false);
    expect(validateParticipantInput("   ", "valid@example.com").valid).toBe(false);
  });

  it("should reject invalid email formats", () => {
    expect(validateParticipantInput("Alice", "not-an-email").valid).toBe(false);
    expect(validateParticipantInput("Alice", "user@domain").valid).toBe(false);
    expect(validateParticipantInput("Alice", "@nodomain.com").valid).toBe(false);
  });
});

describe("Phase 8: Duplicate Prevention & Registration Resolution", () => {
  it("should detect duplicate active tickets for the same attendee email", () => {
    const existingTickets = [
      { ticket_number: "TKT-A1B2C3", participant_email: "alice@example.com", status: "ISSUED" },
      { ticket_number: "TKT-D4E5F6", participant_email: "bob@example.com", status: "CHECKED_IN" },
      { ticket_number: "TKT-G7H8I9", participant_email: "charlie@example.com", status: "REVOKED" },
    ];

    const canIssueNewTicket = (email: string) => {
      const active = existingTickets.find(
        (t) => t.participant_email === email.toLowerCase() && t.status !== "REVOKED"
      );
      return !active;
    };

    expect(canIssueNewTicket("alice@example.com")).toBe(false);
    expect(canIssueNewTicket("bob@example.com")).toBe(false);
    // Revoked ticket allows re-issuance
    expect(canIssueNewTicket("charlie@example.com")).toBe(true);
    // New attendee allows issuance
    expect(canIssueNewTicket("dave@example.com")).toBe(true);
  });

  it("should resolve registration ID and update payment state for existing registrations", () => {
    const existingRegistrations = [
      { id: "reg-1", email: "alice@example.com", status: "REGISTERED", payment_status: "PENDING" },
    ];

    const resolveRegistration = (email: string, isPaidEvent: boolean) => {
      const existing = existingRegistrations.find((r) => r.email === email);
      if (existing) {
        return {
          registrationId: existing.id,
          isNew: false,
          paymentStatus: isPaidEvent ? "APPROVED" : null,
          status: "REGISTERED",
        };
      }
      return {
        registrationId: "new-generated-reg-id",
        isNew: true,
        paymentStatus: isPaidEvent ? "APPROVED" : null,
        status: "REGISTERED",
      };
    };

    // Existing registration linked and marked approved
    const resA = resolveRegistration("alice@example.com", true);
    expect(resA.registrationId).toBe("reg-1");
    expect(resA.isNew).toBe(false);
    expect(resA.paymentStatus).toBe("APPROVED");

    // New attendee creates registration and marks approved
    const resB = resolveRegistration("newuser@example.com", true);
    expect(resB.registrationId).toBe("new-generated-reg-id");
    expect(resB.isNew).toBe(true);
    expect(resB.paymentStatus).toBe("APPROVED");
  });
});

describe("Phase 8: Direct Issuance Cryptographic Pipeline", () => {
  it("should generate standard ticket number and token hash for manual issuance", () => {
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const ticketNumber = generateTicketNumber("TKT");

    expect(ticketNumber).toMatch(/^TKT-[2-9A-HJ-NP-Z]{6}$/);
    expect(tokenHash.length).toBe(64);
    expect(rawToken.length).toBe(43); // 32 bytes base64url unpadded is 43 characters
  });

  it("should construct valid QR codes for direct-issued entrance passes", async () => {
    const rawToken = generateSecureToken(32);
    const ticketUrl = buildTicketUrl(rawToken, "https://ticketplatform.io");
    const qrDataUrl = await generateQrCodeDataUrl(ticketUrl);

    expect(qrDataUrl).toBeDefined();
    expect(qrDataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(ticketUrl).toContain("/t/");
  });
});
