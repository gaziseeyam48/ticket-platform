"use server";

import { getAdminClient } from "@/lib/db/admin";
import { createServerDbClient } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { generateVerifierInvitationToken } from "@/lib/services/verifier-session.service";
import { sendVerifierInviteEmail } from "@/lib/services/email.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { revalidatePath } from "next/cache";

export interface InviteVerifierParams {
  eventId: string;
  name: string;
  email: string;
  expiresInHours?: number;
}

/**
 * Invites a gate verifier with a single-click magic link.
 */
export async function inviteVerifier(params: InviteVerifierParams) {
  const { eventId, name, email, expiresInHours = 72 } = params;

  if (!name || name.trim().length < 2) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Verifier name must be at least 2 characters.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "A valid email address is required.");
  }

  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();

  // 1. Fetch event and verify organization ownership
  const { data: event, error: eventError } = await (adminDb
    .from("events")
    .select("id, name, organization_id, status, organizations(name)")
    .eq("id", eventId)
    .single() as any);

  if (eventError || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  if (event.status === "ENDED" || event.status === "CANCELLED") {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Cannot delegate verifiers for an event with status "${event.status}".`
    );
  }

  // 2. Verify caller membership in the event's organization
  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", event.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  // 3. Generate cryptographic invitation token and expiry timestamp
  const { rawToken, tokenHash } = generateVerifierInvitationToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

  // 4. Check if a verifier with this email already exists for this event
  const { data: existingVerifier } = await (adminDb
    .from("event_verifiers")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("email", normalizedEmail)
    .maybeSingle() as any);

  let verifierRecord: any;

  if (existingVerifier) {
    // Re-issue token & reset status to INVITED with fresh expiration
    const { data: updated, error: updateError } = await ((adminDb as any)
      .from("event_verifiers")
      .update({
        name: name.trim(),
        invitation_token_hash: tokenHash,
        status: "INVITED",
        expires_at: expiresAt,
      })
      .eq("id", existingVerifier.id)
      .select()
      .single() as any);

    if (updateError || !updated) {
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update verifier credentials.");
    }
    verifierRecord = updated;
  } else {
    // Insert new verifier record
    const { data: inserted, error: insertError } = await ((adminDb as any)
      .from("event_verifiers")
      .insert([
        {
          event_id: eventId,
          organization_id: event.organization_id,
          name: name.trim(),
          email: normalizedEmail,
          invitation_token_hash: tokenHash,
          status: "INVITED",
          expires_at: expiresAt,
        },
      ])
      .select()
      .single() as any);

    if (insertError || !inserted) {
      console.error("Error creating verifier:", insertError);
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to create verifier record.");
    }
    verifierRecord = inserted;
  }

  // 5. Build Magic Link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${appUrl}/verify/auth?token=${rawToken}&event=${eventId}`;

  // 6. Send Invitation Email
  let emailSent = false;
  try {
    const emailResult = await sendVerifierInviteEmail({
      to: normalizedEmail,
      verifierName: name.trim(),
      eventName: event.name,
      organizationName: event.organizations?.name || "Event Organizer",
      magicLinkUrl: magicLink,
      expiresInText: `${expiresInHours} hours`,
    });
    emailSent = emailResult.success;
  } catch (emailErr) {
    console.warn("Could not deliver verifier email immediately:", emailErr);
  }

  await logAuditEvent({
    organizationId: event.organization_id,
    eventId: event.id,
    actorId: user.id,
    actorType: "USER",
    action: "VERIFIER_INVITED",
    targetType: "VERIFIER",
    targetId: verifierRecord.id,
    metadata: {
      verifier_name: name.trim(),
      verifier_email: normalizedEmail,
      expires_in_hours: expiresInHours,
      email_sent: emailSent,
    },
  });

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath("/verify");

  return {
    success: true,
    verifier: verifierRecord,
    magicLink,
    emailSent,
  };
}

/**
 * Retrieves all gate verifiers for a specific event.
 */
export async function getEventVerifiers(eventId: string) {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();

  const { data: event } = await (adminDb
    .from("events")
    .select("organization_id")
    .eq("id", eventId)
    .single() as any);

  if (!event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", event.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const { data: verifiers, error } = await (adminDb
    .from("event_verifiers")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false }) as any);

  if (error) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to load event verifiers.");
  }

  return verifiers || [];
}

/**
 * Revokes an existing verifier's gate access permissions.
 */
export async function revokeVerifier(verifierId: string) {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();

  const { data: verifier } = await (adminDb
    .from("event_verifiers")
    .select("id, event_id, organization_id")
    .eq("id", verifierId)
    .single() as any);

  if (!verifier) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Verifier not found.");
  }

  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", verifier.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const { error: updateError } = await ((adminDb as any)
    .from("event_verifiers")
    .update({ status: "REVOKED" })
    .eq("id", verifierId));

  if (updateError) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to revoke verifier.");
  }

  await logAuditEvent({
    organizationId: verifier.organization_id,
    eventId: verifier.event_id,
    actorId: user.id,
    actorType: "USER",
    action: "VERIFIER_REVOKED",
    targetType: "VERIFIER",
    targetId: verifierId,
  });

  revalidatePath(`/org/events/${verifier.event_id}`);
  revalidatePath("/verify");

  return { success: true };
}

/**
 * Re-issues and dispatches a fresh invitation magic link to a verifier.
 */
export async function resendVerifierInvite(verifierId: string) {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();

  const { data: verifier } = await (adminDb
    .from("event_verifiers")
    .select("id, name, email, event_id, organization_id, events(id, name, status, organizations(name))")
    .eq("id", verifierId)
    .single() as any);

  if (!verifier) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Verifier not found.");
  }

  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", verifier.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const { rawToken, tokenHash } = generateVerifierInvitationToken();
  const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

  await ((adminDb as any)
    .from("event_verifiers")
    .update({
      invitation_token_hash: tokenHash,
      status: "INVITED",
      expires_at: expiresAt,
    })
    .eq("id", verifierId));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLink = `${appUrl}/verify/auth?token=${rawToken}&event=${verifier.event_id}`;

  let emailSent = false;
  try {
    const emailResult = await sendVerifierInviteEmail({
      to: verifier.email,
      verifierName: verifier.name,
      eventName: verifier.events.name,
      organizationName: verifier.events.organizations?.name || "Event Organizer",
      magicLinkUrl: magicLink,
      expiresInText: "72 hours",
    });
    emailSent = emailResult.success;
  } catch (err) {
    console.warn("Could not resend email immediately:", err);
  }

  await logAuditEvent({
    organizationId: verifier.organization_id,
    eventId: verifier.event_id,
    actorId: user.id,
    actorType: "USER",
    action: "VERIFIER_RESENT",
    targetType: "VERIFIER",
    targetId: verifierId,
    metadata: {
      verifier_name: verifier.name,
      verifier_email: verifier.email,
      email_sent: emailSent,
    },
  });

  revalidatePath(`/org/events/${verifier.event_id}`);

  return {
    success: true,
    magicLink,
    emailSent,
  };
}
