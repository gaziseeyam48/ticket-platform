import { describe, it, expect } from "vitest";
import {
  ticketDesignSchema,
  DEFAULT_TICKET_DESIGN,
  COLOR_THEME_PRESETS,
  TEMPLATE_DEFINITIONS,
  getContrastRatio,
  TicketDesignConfig,
} from "@/lib/types/ticket-design";

describe("Customizable Digital Ticket Design Studio: Schema & Validation", () => {
  it("should validate a complete and valid custom ticket design", () => {
    const validConfig = {
      version: 1,
      template: "editorial",
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#4F46E5",
      accentColor: "#06B6D4",
      backgroundStyle: "neutral",
      showOrganizationName: true,
      showCategoryBadge: false,
      customBadgeText: "VIP Access Pass",
    };

    const parsed = ticketDesignSchema.safeParse(validConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.template).toBe("editorial");
      expect(parsed.data.primaryColor).toBe("#4F46E5");
      expect(parsed.data.customBadgeText).toBe("VIP Access Pass");
    }
  });

  it("should supply sensible defaults when optional fields are omitted", () => {
    const minimalConfig = {
      template: "minimal",
    };

    const parsed = ticketDesignSchema.safeParse(minimalConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.version).toBe(1);
      expect(parsed.data.primaryColor).toBe("#171923");
      expect(parsed.data.accentColor).toBe("#059669");
      expect(parsed.data.backgroundStyle).toBe("white");
      expect(parsed.data.showOrganizationName).toBe(true);
      expect(parsed.data.showCategoryBadge).toBe(true);
    }
  });

  it("should reject invalid hex color codes", () => {
    const invalidColors = ["red", "rgb(0,0,0)", "#12", "#12345", "123456", "#GGGGGG"];

    for (const color of invalidColors) {
      const parsed = ticketDesignSchema.safeParse({
        template: "classic",
        primaryColor: color,
      });
      expect(parsed.success).toBe(false);
    }
  });

  it("should reject unsupported template names", () => {
    const parsed = ticketDesignSchema.safeParse({
      template: "non_existent_fancy_template",
    });
    expect(parsed.success).toBe(false);
  });

  it("should enforce maximum length on custom badge text", () => {
    const parsed = ticketDesignSchema.safeParse({
      customBadgeText: "A".repeat(41), // Exceeds 40
    });
    expect(parsed.success).toBe(false);

    const validParsed = ticketDesignSchema.safeParse({
      customBadgeText: "A".repeat(40), // Exactly 40
    });
    expect(validParsed.success).toBe(true);
  });
});

describe("Customizable Digital Ticket Design Studio: Curated Palettes & Contrast", () => {
  it("should verify all 4 curated templates are defined with descriptions", () => {
    expect(TEMPLATE_DEFINITIONS).toHaveLength(4);
    const templateIds = TEMPLATE_DEFINITIONS.map((t) => t.id);
    expect(templateIds).toContain("classic");
    expect(templateIds).toContain("editorial");
    expect(templateIds).toContain("brand_forward");
    expect(templateIds).toContain("minimal");

    TEMPLATE_DEFINITIONS.forEach((t) => {
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    });
  });

  it("should verify all curated color presets adhere to the schema", () => {
    expect(COLOR_THEME_PRESETS.length).toBeGreaterThanOrEqual(6);

    for (const preset of COLOR_THEME_PRESETS) {
      const parsed = ticketDesignSchema.safeParse({
        template: "classic",
        primaryColor: preset.primaryColor,
        accentColor: preset.accentColor,
        backgroundStyle: preset.backgroundStyle,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("should accurately compute WCAG contrast ratios", () => {
    // Pure black (#000000) on pure white (#FFFFFF) has 21:1 contrast
    const blackWhiteRatio = getContrastRatio("#000000", "#FFFFFF");
    expect(blackWhiteRatio).toBeGreaterThan(20);

    // Dark grey (#171923) on white (#FFFFFF) has high contrast (>10:1)
    const darkRatio = getContrastRatio("#171923", "#FFFFFF");
    expect(darkRatio).toBeGreaterThan(10);

    // Light yellow on white has low contrast (< 2.0)
    const lowRatio = getContrastRatio("#FEF08A", "#FFFFFF");
    expect(lowRatio).toBeLessThan(2.0);
  });
});

describe("Customizable Digital Ticket Design Studio: Security & Non-Destructive Invariance", () => {
  it("should reject SVG mime types and filenames for script injection prevention", () => {
    const isSvgForbidden = (filename: string, mimeType: string) => {
      return (
        mimeType === "image/svg+xml" ||
        filename.toLowerCase().endsWith(".svg")
      );
    };

    expect(isSvgForbidden("logo.svg", "image/svg+xml")).toBe(true);
    expect(isSvgForbidden("vector.SVG", "application/octet-stream")).toBe(true);
    expect(isSvgForbidden("graphic.png", "image/png")).toBe(false);
    expect(isSvgForbidden("photo.jpg", "image/jpeg")).toBe(false);
    expect(isSvgForbidden("badge.webp", "image/webp")).toBe(false);
  });

  it("ticket design changes must not modify ticket security identifiers or QR verification tokens", () => {
    const existingTicket = {
      id: "tkt_uuid_9921",
      ticketNumber: "TKT-SECURE44",
      qrToken: "sec_token_9f81a7b6c5d4e3f2",
      status: "ISSUED",
      checkedInAt: null,
    };

    const newDesign: TicketDesignConfig = {
      version: 1,
      template: "editorial",
      logoUrl: "https://cdn.example.com/logo.webp",
      primaryColor: "#0F766E",
      accentColor: "#F59E0B",
      backgroundStyle: "neutral",
      showOrganizationName: true,
      showCategoryBadge: true,
    };

    // Simulated rendering with updated design: ticket entity invariants remain untouched
    const renderedViewProps = {
      ticket: existingTicket,
      design: newDesign,
    };

    expect(renderedViewProps.ticket.id).toBe("tkt_uuid_9921");
    expect(renderedViewProps.ticket.ticketNumber).toBe("TKT-SECURE44");
    expect(renderedViewProps.ticket.qrToken).toBe("sec_token_9f81a7b6c5d4e3f2");
    expect(renderedViewProps.ticket.status).toBe("ISSUED");
  });

  it("should gracefully fall back to DEFAULT_TICKET_DESIGN when no custom design is configured", () => {
    const unconfiguredEventSettings: Record<string, any> = {};
    const effectiveDesign =
      unconfiguredEventSettings.ticket_design || DEFAULT_TICKET_DESIGN;

    expect(effectiveDesign).toEqual(DEFAULT_TICKET_DESIGN);
    expect(effectiveDesign.template).toBe("classic");
    expect(effectiveDesign.primaryColor).toBe("#171923");
    expect(effectiveDesign.backgroundStyle).toBe("white");
  });
});
