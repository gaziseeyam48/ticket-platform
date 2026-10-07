import { createHash, randomBytes } from "crypto";

/**
 * Generates a cryptographically secure random token (256-bit entropy by default).
 * Encoded in base64url (URL-safe, no padding).
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Computes a SHA-256 hash of an opaque token.
 * This is stored in the database instead of the raw secret token.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a human-readable ticket ID (e.g., TKT-7B9E2A)
 */
export function generateTicketNumber(prefix = "TKT"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // omitted ambiguous chars (0, 1, I, O)
  const bytes = randomBytes(6);
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars[bytes[i] % chars.length];
  }
  return `${prefix}-${randomStr}`;
}
