import { z } from "zod";

export type TicketTemplateId = "classic" | "editorial" | "brand_forward" | "minimal";
export type TicketBackgroundStyle = "white" | "neutral" | "dark";

export interface TicketDesignConfig {
  version: 1;
  template: TicketTemplateId;
  logoUrl?: string | null;
  primaryColor: string; // Hex color, e.g. "#171923"
  accentColor: string;  // Hex color, e.g. "#059669"
  backgroundStyle: TicketBackgroundStyle;
  showOrganizationName: boolean;
  showCategoryBadge: boolean;
  customBadgeText?: string | null;
  updatedAt?: string;
}

export const DEFAULT_TICKET_DESIGN: TicketDesignConfig = {
  version: 1,
  template: "classic",
  logoUrl: null,
  primaryColor: "#171923",
  accentColor: "#059669",
  backgroundStyle: "white",
  showOrganizationName: true,
  showCategoryBadge: true,
  customBadgeText: null,
};

// Hex color regex (#RGB, #RRGGBB)
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const ticketDesignSchema = z.object({
  version: z.literal(1).default(1),
  template: z.enum(["classic", "editorial", "brand_forward", "minimal"]).default("classic"),
  logoUrl: z.string().url().nullable().optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(HEX_COLOR_REGEX, "Primary color must be a valid hex code (e.g. #171923)")
    .default("#171923"),
  accentColor: z
    .string()
    .regex(HEX_COLOR_REGEX, "Accent color must be a valid hex code (e.g. #059669)")
    .default("#059669"),
  backgroundStyle: z.enum(["white", "neutral", "dark"]).default("white"),
  showOrganizationName: z.boolean().default(true),
  showCategoryBadge: z.boolean().default(true),
  customBadgeText: z.string().max(40, "Badge text cannot exceed 40 characters").nullable().optional(),
  updatedAt: z.string().optional(),
});

export interface ColorThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundStyle: TicketBackgroundStyle;
}

export const COLOR_THEME_PRESETS: ColorThemePreset[] = [
  {
    id: "classic",
    name: "TicketKoi Classic",
    primaryColor: "#171923",
    accentColor: "#059669",
    backgroundStyle: "white",
  },
  {
    id: "midnight",
    name: "Midnight",
    primaryColor: "#0F172A",
    accentColor: "#38BDF8",
    backgroundStyle: "dark",
  },
  {
    id: "forest",
    name: "Forest",
    primaryColor: "#064E3B",
    accentColor: "#10B981",
    backgroundStyle: "white",
  },
  {
    id: "ocean",
    name: "Ocean",
    primaryColor: "#1E3A8A",
    accentColor: "#0284C7",
    backgroundStyle: "white",
  },
  {
    id: "violet",
    name: "Violet",
    primaryColor: "#4C1D95",
    accentColor: "#8B5CF6",
    backgroundStyle: "white",
  },
  {
    id: "warm_neutral",
    name: "Warm Neutral",
    primaryColor: "#451A03",
    accentColor: "#D97706",
    backgroundStyle: "neutral",
  },
];

export interface TemplateDefinition {
  id: TicketTemplateId;
  name: string;
  description: string;
  tagline: string;
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Timeless & Clean",
    description: "A balanced, familiar admission pass layout with clear hierarchy and central perforated QR.",
  },
  {
    id: "editorial",
    name: "Editorial",
    tagline: "Bold & Typographic",
    description: "Typography-led composition with accent header ribbons and distinctive framed ticket details.",
  },
  {
    id: "brand_forward",
    name: "Brand Forward",
    tagline: "Immersive & Expressive",
    description: "Showcases your logo and brand primary color in a prominent hero block above the pass details.",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Sleek & Essential",
    description: "Compact, modern aesthetic with hairline dividers and focused attendee verification essentials.",
  },
];

/**
 * Calculates relative luminance for WCAG contrast checks.
 */
function getRelativeLuminance(hex: string): number {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const toLinear = (val: number) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Checks contrast ratio between two hex colors.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getRelativeLuminance(hex1);
    const l2 = getRelativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
  } catch {
    return 4.5; // Safe default
  }
}
