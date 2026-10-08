import QRCode from "qrcode";

/**
 * Generates a high-quality Base64 Data URL (PNG) representation of a QR code.
 *
 * @param content The string payload to encode (e.g., public verification token or URL)
 * @returns Promise<string> Base64 data URL string (data:image/png;base64,...)
 */
export async function generateQrCodeDataUrl(content: string): Promise<string> {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#09090b", // zinc-950
      light: "#ffffff",
    },
  });
}

/**
 * Builds the canonical public verification URL for a given ticket token.
 *
 * @param publicToken Unhashed raw ticket token
 * @param baseUrl Optional base application URL (defaults to NEXT_PUBLIC_APP_URL or localhost)
 */
export function buildTicketUrl(publicToken: string, baseUrl?: string): string {
  const origin = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${origin.replace(/\/+$/, "")}/t/${encodeURIComponent(publicToken)}`;
}
