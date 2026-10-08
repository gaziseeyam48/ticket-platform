import { describe, it, expect } from "vitest";
import { generateQrCodeDataUrl, buildTicketUrl } from "@/lib/services/qr.service";
import { buildTicketEmailHtml } from "@/lib/services/email.service";
import { generateSecureToken, hashToken, generateTicketNumber } from "@/lib/utils/crypto";

describe("Phase 6: QR Code & Verification URL Generation", () => {
  it("should generate a valid base64 PNG data URL for QR codes", async () => {
    const payload = "https://example.com/t/sample-public-token-123";
    const dataUrl = await generateQrCodeDataUrl(payload);

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it("should construct canonical ticket verification URLs", () => {
    const token = "token-abc-xyz-456";
    const url = buildTicketUrl(token, "https://ticketplatform.io");

    expect(url).toBe("https://ticketplatform.io/t/token-abc-xyz-456");
  });
});

describe("Phase 6: Ticket Email Template", () => {
  it("should generate responsive HTML containing ticket details and access button", () => {
    const html = buildTicketEmailHtml({
      to: "attendee@example.com",
      participantName: "Alice Walker",
      eventName: "Cloud Native Summit 2026",
      ticketNumber: "TKT-9X7K2A",
      eventDate: "Saturday, November 14, 2026 at 10:00 AM",
      eventLocation: "Metropolitan Convention Center",
      ticketUrl: "https://ticketplatform.io/t/token-secret-123",
    });

    expect(html).toContain("Cloud Native Summit 2026");
    expect(html).toContain("Alice Walker");
    expect(html).toContain("TKT-9X7K2A");
    expect(html).toContain("Metropolitan Convention Center");
    expect(html).toContain("https://ticketplatform.io/t/token-secret-123");
    expect(html).toContain("View & Download Ticket");
  });
});

describe("Phase 6: Cryptographic Ticket Pipeline & Integrity", () => {
  it("should create unguessable raw tokens and reproducible hashes", () => {
    const rawToken = generateSecureToken(32);
    const hashA = hashToken(rawToken);
    const hashB = hashToken(rawToken);

    expect(hashA).toBe(hashB);
    expect(hashA.length).toBe(64);
    // Raw token is not stored, only hash is stored
    expect(rawToken).not.toBe(hashA);
  });

  it("should format ticket identifiers with standard prefix", () => {
    const ticketId = generateTicketNumber("TKT");
    expect(ticketId).toMatch(/^TKT-[2-9A-HJ-NP-Z]{6}$/);
  });
});
