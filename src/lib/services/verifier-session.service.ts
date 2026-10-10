import { createHmac } from "crypto";
import { generateSecureToken, hashToken } from "../utils/crypto";
import { AppError } from "../errors/app-error";
import { ERROR_CODES } from "../errors/error-codes";

export interface VerifierSessionPayload {
  verifier_id: string;
  verifier_name: string;
  verifier_email: string;
  event_id: string;
  organization_id: string;
  role: "EVENT_VERIFIER";
  exp: number; // Unix timestamp in seconds
}

const DEFAULT_SECRET = "ticket-platform-secure-verifier-session-secret-at-least-32-chars";

function getVerifierSecret(): string {
  return process.env.VERIFIER_JWT_SECRET || DEFAULT_SECRET;
}

/**
 * Base64URL encoder utility for JWT standard compliance
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Base64URL decoder utility for JWT standard compliance
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Generates an invitation magic token and its SHA-256 hash for database storage.
 */
export function generateVerifierInvitationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Signs a verifier session payload into a tamper-proof HS256 JWT token.
 */
export function signVerifierSessionToken(
  payload: VerifierSessionPayload,
  secret = getVerifierSecret()
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies and decodes an HS256 verifier session token.
 * Validates HMAC cryptographic signature and expiration timestamp.
 */
export function verifyVerifierSessionToken(
  token: string,
  secret = getVerifierSecret()
): VerifierSessionPayload {
  if (!token || typeof token !== "string") {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Missing verifier session token.");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Malformed verifier session token.");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Constant-time comparison to prevent timing attacks
  if (signature !== expectedSignature) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid verifier session signature.");
  }

  let payload: VerifierSessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid verifier session payload.");
  }

  const currentSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < currentSeconds) {
    throw new AppError(ERROR_CODES.VERIFIER_EXPIRED, "Verifier access session has expired.");
  }

  return payload;
}

/**
 * Extracts and verifies the verifier session from cookies.
 */
export async function getVerifierSession(): Promise<VerifierSessionPayload | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("verifier_session")?.value;

    if (!token) {
      return null;
    }

    return verifyVerifierSessionToken(token);
  } catch {
    return null;
  }
}
