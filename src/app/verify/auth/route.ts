import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db/admin";
import { hashToken } from "@/lib/utils/crypto";
import { signVerifierSessionToken } from "@/lib/services/verifier-session.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const eventId = searchParams.get("event");

  const baseUrl = request.nextUrl.origin;

  if (!token || !eventId) {
    return NextResponse.redirect(
      new URL("/verify?error=missing_credentials", baseUrl)
    );
  }

  const tokenHash = hashToken(token.trim());
  const adminDb = getAdminClient();

  // Query verifier record matching the cryptographic invitation token and target event
  const { data: verifier, error } = await (adminDb
    .from("event_verifiers")
    .select("id, name, email, event_id, organization_id, status, expires_at, events(id, name, status)")
    .eq("invitation_token_hash", tokenHash)
    .eq("event_id", eventId)
    .maybeSingle() as any);

  if (error || !verifier) {
    return NextResponse.redirect(
      new URL("/verify?error=invalid_token", baseUrl)
    );
  }

  // Check if access was revoked by administrator
  if (verifier.status === "REVOKED") {
    return NextResponse.redirect(
      new URL("/verify?error=revoked", baseUrl)
    );
  }

  // Check token expiration
  const now = new Date();
  const expiresAtDate = new Date(verifier.expires_at);
  if (expiresAtDate <= now) {
    // Automatically transition status to EXPIRED
    await ((adminDb as any)
      .from("event_verifiers")
      .update({ status: "EXPIRED" })
      .eq("id", verifier.id));

    return NextResponse.redirect(
      new URL("/verify?error=expired", baseUrl)
    );
  }

  // Check if event has ended or was cancelled
  if (
    verifier.events.status === "ENDED" ||
    verifier.events.status === "CANCELLED"
  ) {
    return NextResponse.redirect(
      new URL("/verify?error=event_ended", baseUrl)
    );
  }

  // Activate verifier if currently INVITED
  const updatePayload: any = {
    last_accessed_at: now.toISOString(),
  };
  if (verifier.status === "INVITED") {
    updatePayload.status = "ACTIVE";
  }

  await ((adminDb as any)
    .from("event_verifiers")
    .update(updatePayload)
    .eq("id", verifier.id));

  // Construct signed, tamper-proof verifier session JWT
  const expSeconds = Math.floor(expiresAtDate.getTime() / 1000);
  const sessionToken = signVerifierSessionToken({
    verifier_id: verifier.id,
    verifier_name: verifier.name,
    verifier_email: verifier.email,
    event_id: verifier.event_id,
    organization_id: verifier.organization_id,
    role: "EVENT_VERIFIER",
    exp: expSeconds,
  });

  // Calculate remaining cookie max-age
  const maxAge = Math.max(0, Math.floor((expiresAtDate.getTime() - Date.now()) / 1000));

  // Set HTTP-only, secure cookie and redirect to the gate verification scanner
  const response = NextResponse.redirect(
    new URL(`/verify?event_id=${eventId}`, baseUrl)
  );

  response.cookies.set("verifier_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
