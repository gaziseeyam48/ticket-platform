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

describe("Phase 6: Ticket Email Template & Digital Pass Rendering", () => {
  it("should generate a complete, responsive digital admission pass directly inside the email", () => {
    const html = buildTicketEmailHtml({
      to: "attendee@example.com",
      participantName: "Alice Walker",
      eventName: "Cloud Native Summit 2026",
      ticketNumber: "TKT-9X7K2A",
      category: "VIP Admission",
      eventDate: "Saturday, November 14, 2026 at 10:00 AM",
      eventLocation: "Metropolitan Convention Center",
      organizationName: "Tech Summits Global",
      ticketUrl: "https://ticketplatform.io/t/token-secret-123",
      qrCodeDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
    });

    // Content checks
    expect(html).toContain("Cloud Native Summit 2026");
    expect(html).toContain("Alice Walker");
    expect(html).toContain("TKT-9X7K2A");
    expect(html).toContain("VIP Admission");
    expect(html).toContain("Metropolitan Convention Center");
    expect(html).toContain("Tech Summits Global");
    expect(html).toContain("https://ticketplatform.io/t/token-secret-123");
    expect(html).toContain("Open Full Ticket");
    expect(html).toContain("VERIFIED ADMISSION PASS");
    expect(html).toContain("Your ticket is ready.");
    expect(html).toContain("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==");
  });

  it("should sanitize and escape user-provided strings against HTML injection", () => {
    const maliciousPayload = {
      to: "hacker@example.com",
      participantName: "<script>alert('xss')</script>John",
      eventName: "CyberCon & Security > Summit \"2026\"",
      ticketNumber: "TKT-SECURE",
      ticketUrl: "https://example.com/t/test",
    };

    const html = buildTicketEmailHtml(maliciousPayload);

    expect(html).not.toContain("<script>alert('xss')</script>");
    expect(html).toContain("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;John");
    expect(html).toContain("CyberCon &amp; Security &gt; Summit &quot;2026&quot;");
  });

  it("should apply customized brand colors and logos when configured", () => {
    const customizedHtml = buildTicketEmailHtml({
      to: "custom@example.com",
      participantName: "Seeyam",
      eventName: "FPS Film Screening",
      ticketNumber: "TKT-CUR5WA",
      ticketUrl: "https://example.com/t/cur5wa",
      ticketDesign: {
        version: 1,
        template: "editorial",
        logoUrl: "https://cdn.example.com/brand-logo.png",
        primaryColor: "#4338CA",
        accentColor: "#06B6D4",
        backgroundStyle: "white",
        showOrganizationName: true,
        showCategoryBadge: true,
      },
    });

    expect(customizedHtml).toContain("#4338CA");
    expect(customizedHtml).toContain("https://cdn.example.com/brand-logo.png");
    expect(customizedHtml).toContain("FPS Film Screening");
  });

  it("should provide an accessible fallback when QR code data URL is missing", () => {
    const noQRPayload = {
      to: "noqr@example.com",
      participantName: "Bob Smith",
      eventName: "Community Meetup",
      ticketNumber: "TKT-FALLBACK1",
      ticketUrl: "https://example.com/t/fallback",
    };

    const html = buildTicketEmailHtml(noQRPayload);
    expect(html).toContain("TKT-FALLBACK1");
    expect(html).toContain("Present at turnstile");
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
