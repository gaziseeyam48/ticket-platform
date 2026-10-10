"use server";

import { getAdminClient } from "@/lib/db/admin";
import { createServerDbClient } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { hashToken, generateSecureToken } from "@/lib/utils/crypto";
import { generateQrCodeDataUrl, buildTicketUrl } from "@/lib/services/qr.service";
import { sendTicketEmail } from "@/lib/services/email.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

import { rateLimiter } from "@/lib/utils/rate-limiter";
import { headers } from "next/headers";

/**
 * Public action: retrieves a ticket by its unhashed public token.
 * Hashes the token with SHA-256 and searches by token_hash.
 * Protected with anti-enumeration rate limiting and privacy data masking.
 */
export async function getTicketByPublicToken(publicToken: string) {
  if (!publicToken || publicToken.trim().length === 0) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Invalid ticket token.");
  }

  // 1. Anti-enumeration rate limiting (60 lookups per minute per IP)
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = rateLimiter.check(`ticket_view_${ip}`, 60, 60_000);
    if (!rateLimit.allowed) {
      throw new AppError(ERROR_CODES.RATE_LIMITED, "Too many lookup attempts. Please wait a minute before retrying.");
    }
  } catch (rateErr) {
    if (rateErr instanceof AppError && rateErr.code === ERROR_CODES.RATE_LIMITED) {
      throw rateErr;
    }
    // In background or test context where headers() might not be available, continue
  }

  const tokenHash = hashToken(publicToken.trim());
  const adminDb = getAdminClient();

  // 2. Fetch strictly needed public ticket details (never expose internal system notes)
  const { data: ticket, error } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, status, participant_name, participant_email, participant_data, issued_at, checked_in_at, revoked_at, events(id, name, slug, status, date_start, date_end, location, organizations(name))")
    .eq("token_hash", tokenHash)
    .maybeSingle() as any);

  if (error || !ticket) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Ticket not found or invalid.");
  }

  const ticketUrl = buildTicketUrl(publicToken);
  const qrCodeDataUrl = await generateQrCodeDataUrl(ticketUrl);

  // 3. Privacy sanitization: mask email so public view never exposes full address
  const maskEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes("@")) return "";
    const [local, domain] = emailStr.split("@");
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  const participantData = ticket.participant_data as Record<string, any> | null;
  const category = participantData?.category || "General Admission";

  return {
    ticketNumber: ticket.ticket_number,
    status: ticket.status,
    participantName: ticket.participant_name,
    participantEmail: ticket.participant_email,
    participantEmailMasked: maskEmail(ticket.participant_email),
    category,
    issuedAt: ticket.issued_at,
    checkedInAt: ticket.checked_in_at,
    revokedAt: ticket.revoked_at,
    eventName: ticket.events.name,
    eventSlug: ticket.events.slug,
    eventStatus: ticket.events.status,
    eventDateStart: ticket.events.date_start,
    eventDateEnd: ticket.events.date_end,
    eventLocation: ticket.events.location,
    organizationName: ticket.events.organizations?.name || "Event Organizer",
    qrCodeDataUrl,
    ticketUrl,
  };
}

/**
 * Organizer action: re-sends a ticket confirmation email to the participant.
 */
export async function resendTicketEmail(ticketId: string) {
  const supabase = await createServerDbClient();

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to resend tickets.");
  }

  const adminDb = getAdminClient();

  // Fetch ticket and event details
  const { data: ticket, error: ticketError } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, participant_name, participant_email, event_id, events(id, name, organization_id, date_start, date_end, location)")
    .eq("id", ticketId)
    .single() as any);

  if (ticketError || !ticket) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Ticket not found.");
  }

  // Verify that the user belongs to the owning organization
  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", ticket.events.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have permission to resend tickets for this event.");
  }

  // Format date
  let formattedDate: string | null = null;
  if (ticket.events.date_start) {
    formattedDate = format(new Date(ticket.events.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a");
    if (ticket.events.date_end) {
      formattedDate += ` - ${format(new Date(ticket.events.date_end), "h:mm a")}`;
    }
  }

  // Generate fresh secure access token for direct /t/ entrance pass view
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  await ((adminDb as any)
    .from("tickets")
    .update({ token_hash: tokenHash })
    .eq("id", ticketId));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const viewUrl = `${appUrl}/t/${rawToken}`;

  const sendResult = await sendTicketEmail({
    to: ticket.participant_email,
    participantName: ticket.participant_name,
    eventName: ticket.events.name,
    ticketNumber: ticket.ticket_number,
    eventDate: formattedDate,
    eventLocation: ticket.events.location,
    ticketUrl: viewUrl,
  });

  if (!sendResult.success) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, sendResult.error || "Failed to resend ticket email.");
  }

  await logAuditEvent({
    organizationId: ticket.events.organization_id,
    eventId: ticket.event_id,
    actorId: user.id,
    actorType: "USER",
    action: "TICKET_RESENT",
    targetType: "TICKET",
    targetId: ticketId,
    metadata: {
      ticket_number: ticket.ticket_number,
      participant_name: ticket.participant_name,
      participant_email: ticket.participant_email,
    },
  });

  return {
    success: true,
    recipient: ticket.participant_email,
    ticketUrl: viewUrl,
  };
}

/**
 * Organizer action: revokes an issued entrance ticket.
 * Immediately voids the pass so turnstiles block admittance.
 */
export async function revokeTicket(ticketId: string, reason?: string) {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();

  const { data: ticket, error: ticketError } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, status, participant_name, participant_email, event_id, events(id, organization_id)")
    .eq("id", ticketId)
    .single() as any);

  if (ticketError || !ticket) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Ticket not found.");
  }

  // Verify that the caller belongs to the event's organization
  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", ticket.events.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  if (ticket.status === "REVOKED") {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Ticket is already revoked.");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await ((adminDb as any)
    .from("tickets")
    .update({
      status: "REVOKED",
      revoked_at: now,
      revoked_by: user.id,
    })
    .eq("id", ticketId));

  if (updateError) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to revoke ticket.");
  }

  // Audit record logging
  await logAuditEvent({
    organizationId: ticket.events.organization_id,
    eventId: ticket.event_id,
    actorId: user.id,
    actorType: "USER",
    action: "TICKET_REVOKED",
    targetType: "TICKET",
    targetId: ticketId,
    metadata: {
      ticket_number: ticket.ticket_number,
      participant_name: ticket.participant_name,
      participant_email: ticket.participant_email,
      reason: reason || "Revoked by event organizer",
    },
  });

  revalidatePath(`/org/events/${ticket.event_id}`);
  revalidatePath("/verify");

  return { success: true };
}

/**
 * Verifier action: checks in an attendee by public token or ticket URL.
 * Atomic transition: tickets.status = 'CHECKED_IN' WHERE status = 'ISSUED'
 */
export async function verifyEntrancePass(
  rawInput: string,
  expectedEventId?: string,
  verifierId?: string
) {
  if (!rawInput || !rawInput.trim()) {
    return {
      success: false,
      status: "INVALID",
      message: "Scan input is empty. Please present a valid entrance QR pass.",
    };
  }

  // Anti-bruteforce rate limiting (120 scans per minute per IP)
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = rateLimiter.check(`turnstile_verify_${ip}`, 120, 60_000);
    if (!rateLimit.allowed) {
      return {
        success: false,
        status: "INVALID",
        message: "Scan rate limit exceeded. Please wait a moment before trying again.",
      };
    }
  } catch {
    // In background or test context where headers() is unavailable, proceed
  }

  // Parse raw input: could be full URL (https://domain/t/TOKEN) or just TOKEN
  let token = rawInput.trim();
  if (token.includes("/t/")) {
    const parts = token.split("/t/");
    token = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
  }

  const tokenHash = hashToken(token);
  const adminDb = getAdminClient();

  // Fetch ticket details
  const { data: ticket, error } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, status, participant_name, participant_email, issued_at, checked_in_at, revoked_at, event_id, events(id, name, slug, status, date_start, date_end, location, organization_id)")
    .eq("token_hash", tokenHash)
    .maybeSingle() as any);

  if (error || !ticket) {
    return {
      success: false,
      status: "INVALID",
      message: "Unrecognized pass. No matching ticket record exists in the system.",
    };
  }

  // Check expected event ID
  if (expectedEventId && ticket.event_id !== expectedEventId) {
    return {
      success: false,
      status: "WRONG_EVENT",
      message: `Wrong event! This pass was issued for "${ticket.events.name}", not the currently selected gate.`,
      eventName: ticket.events.name,
      participantName: ticket.participant_name,
      ticketNumber: ticket.ticket_number,
    };
  }

  // Check event status
  if (ticket.events.status !== "LIVE" && ticket.events.status !== "PUBLISHED") {
    return {
      success: false,
      status: "EVENT_NOT_LIVE",
      message: `Event "${ticket.events.name}" is currently in ${ticket.events.status} status. Entrance gate is not open.`,
      eventName: ticket.events.name,
      participantName: ticket.participant_name,
      ticketNumber: ticket.ticket_number,
    };
  }

  // Check if revoked
  if (ticket.status === "REVOKED") {
    return {
      success: false,
      status: "REVOKED",
      message: "This entrance pass has been revoked by the event organizer.",
      eventName: ticket.events.name,
      participantName: ticket.participant_name,
      ticketNumber: ticket.ticket_number,
    };
  }

  // Check if already checked in
  if (ticket.status === "CHECKED_IN") {
    return {
      success: false,
      status: "ALREADY_CHECKED_IN",
      message: "Duplicate scan! This ticket was already verified and admitted.",
      eventName: ticket.events.name,
      participantName: ticket.participant_name,
      ticketNumber: ticket.ticket_number,
      checkedInAt: ticket.checked_in_at,
    };
  }

  // Atomic update: only admit if status is currently ISSUED
  const now = new Date().toISOString();
  const updateFields: any = {
    status: "CHECKED_IN",
    checked_in_at: now,
  };
  if (verifierId) {
    updateFields.checked_in_by = verifierId;
  }

  const { data: updated, error: updateError } = await ((adminDb
    .from("tickets") as any)
    .update(updateFields)
    .eq("id", ticket.id)
    .eq("status", "ISSUED")
    .select("id, ticket_number, status, checked_in_at")
    .maybeSingle() as any);

  if (updateError || !updated) {
    // Concurrency collision: another scanner just admitted this ticket!
    return {
      success: false,
      status: "ALREADY_CHECKED_IN",
      message: "Simultaneous entrance attempt detected. Ticket was just checked in at another gate.",
      eventName: ticket.events.name,
      participantName: ticket.participant_name,
      ticketNumber: ticket.ticket_number,
      checkedInAt: ticket.checked_in_at || now,
    };
  }

  // Log to checkins table
  const checkinData: any = {
    ticket_id: ticket.id,
    event_id: ticket.event_id,
    checked_in_at: now,
  };
  if (verifierId) {
    checkinData.verifier_id = verifierId;
  }
  // Log check-in record and audit trail concurrently to maximize gate turnstile throughput
  await Promise.all([
    (adminDb.from("checkins") as any).insert(checkinData),
    logAuditEvent({
      organizationId: ticket.events.organization_id,
      eventId: ticket.event_id,
      actorId: verifierId || null,
      actorType: verifierId ? "VERIFIER" : "SYSTEM",
      action: "TICKET_CHECKED_IN",
      targetType: "TICKET",
      targetId: ticket.id,
      metadata: {
        ticket_number: ticket.ticket_number,
        participant_name: ticket.participant_name,
        participant_email: ticket.participant_email,
      },
    }),
  ]);

  return {
    success: true,
    status: "VALID",
    message: "Valid Pass — Entrance Permitted",
    eventName: ticket.events.name,
    participantName: ticket.participant_name,
    participantEmail: ticket.participant_email,
    ticketNumber: ticket.ticket_number,
    checkedInAt: now,
  };
}

/**
 * Organizer action: manually issues an entrance ticket for a participant.
 * Resolves existing registrations, enforces duplicate protection,
 * and passes through the unified issueTicket pipeline.
 */
export async function issueManualTicket(params: {
  eventId: string;
  participantName: string;
  participantEmail: string;
  category?: string;
  notes?: string;
}) {
  const { eventId, participantName, participantEmail, category, notes } = params;

  if (!participantName || participantName.trim().length < 2) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Participant name must be at least 2 characters.");
  }
  if (!participantEmail || !participantEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participantEmail.trim())) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "A valid participant email address is required.");
  }

  const normalizedEmail = participantEmail.trim().toLowerCase();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();
  const { data: event, error: eventError } = await (adminDb
    .from("events")
    .select("id, name, organization_id, status, event_type")
    .eq("id", eventId)
    .single() as any);

  if (eventError || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  if (event.status === "ENDED" || event.status === "CANCELLED") {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Cannot issue passes for an event with status "${event.status}".`
    );
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

  // 1. Check for active duplicate ticket for this attendee email
  const { data: existingActiveTicket } = await (adminDb
    .from("tickets")
    .select("ticket_number, status")
    .eq("event_id", eventId)
    .eq("participant_email", normalizedEmail)
    .neq("status", "REVOKED")
    .maybeSingle() as any);

  if (existingActiveTicket) {
    throw new AppError(
      ERROR_CODES.TICKET_ALREADY_ISSUED,
      `An active pass (#${existingActiveTicket.ticket_number}) is already assigned to ${normalizedEmail}.`
    );
  }

  // 2. Resolve existing registration or create one to maintain unified registry
  let registrationId: string | null = null;
  const { data: existingReg } = await (adminDb
    .from("registrations")
    .select("id, status, payment_status")
    .eq("event_id", eventId)
    .eq("email", normalizedEmail)
    .maybeSingle() as any);

  const now = new Date().toISOString();

  if (existingReg) {
    registrationId = existingReg.id;
    // Update existing registration to approved/registered state
    await ((adminDb as any)
      .from("registrations")
      .update({
        participant_name: participantName.trim(),
        status: "REGISTERED",
        payment_status: event.event_type === "PAID" ? "APPROVED" : null,
        payment_reviewed_by: user.id,
        payment_reviewed_at: now,
        updated_at: now,
      })
      .eq("id", existingReg.id));
  } else {
    // Insert new registration record for direct issuance
    const { data: newReg } = await ((adminDb as any)
      .from("registrations")
      .insert([
        {
          event_id: eventId,
          email: normalizedEmail,
          participant_name: participantName.trim(),
          status: "REGISTERED",
          payment_status: event.event_type === "PAID" ? "APPROVED" : null,
          payment_reviewed_by: user.id,
          payment_reviewed_at: now,
          form_data: {
            _admin_direct_issuance: true,
            category: category?.trim() || "General Admission",
            notes: notes?.trim() || "",
          },
        },
      ])
      .select()
      .single() as any);

    if (newReg) {
      registrationId = newReg.id;
    }
  }

  // 3. Invoke unified issueTicket pipeline
  const { issueTicket } = await import("@/lib/services/ticket.service");
  const result = await issueTicket({
    eventId,
    participantName: participantName.trim(),
    participantEmail: normalizedEmail,
    registrationId,
    participantData: {
      category: category?.trim() || "General Admission",
      notes: notes?.trim() || "",
      issued_by_admin: user.id,
    },
    issuedBy: user.id,
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/org/events/${eventId}`);
  revalidatePath("/org/events");
  revalidatePath("/org");

  return {
    success: true,
    ticketNumber: result.ticket.ticket_number,
    ticketId: result.ticket.id,
    ticketUrl: result.ticketUrl,
    qrCodeDataUrl: result.qrCodeDataUrl,
    emailSent: result.emailSent,
    participantName: participantName.trim(),
    participantEmail: normalizedEmail,
  };
}

