"use server";

import { getAdminClient } from "@/lib/db/admin";
import { createServerDbClient } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { hashToken } from "@/lib/utils/crypto";
import { generateQrCodeDataUrl, buildTicketUrl } from "@/lib/services/qr.service";
import { sendTicketEmail } from "@/lib/services/email.service";
import { format } from "date-fns";

/**
 * Public action: retrieves a ticket by its unhashed public token.
 * Hashes the token with SHA-256 and searches by token_hash.
 */
export async function getTicketByPublicToken(publicToken: string) {
  if (!publicToken || publicToken.trim().length === 0) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Invalid ticket token.");
  }

  const tokenHash = hashToken(publicToken.trim());
  const adminDb = getAdminClient();

  const { data: ticket, error } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, status, participant_name, participant_email, issued_at, checked_in_at, revoked_at, events(id, name, slug, status, date_start, date_end, location, organizations(name))")
    .eq("token_hash", tokenHash)
    .maybeSingle() as any);

  if (error || !ticket) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Ticket not found or invalid.");
  }

  const ticketUrl = buildTicketUrl(publicToken);
  const qrCodeDataUrl = await generateQrCodeDataUrl(ticketUrl);

  return {
    ticketNumber: ticket.ticket_number,
    status: ticket.status,
    participantName: ticket.participant_name,
    participantEmail: ticket.participant_email,
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

  // For resend, create a direct view URL
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/events/${ticket.events.slug}`;

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

  return {
    success: true,
    recipient: ticket.participant_email,
  };
}

/**
 * Verifier action: checks in an attendee by public token or ticket URL.
 * Atomic transition: tickets.status = 'CHECKED_IN' WHERE status = 'ISSUED'
 */
export async function verifyEntrancePass(rawInput: string, expectedEventId?: string) {
  if (!rawInput || !rawInput.trim()) {
    return {
      success: false,
      status: "INVALID",
      message: "Scan input is empty. Please present a valid entrance QR pass.",
    };
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
  const { data: updated, error: updateError } = await ((adminDb
    .from("tickets") as any)
    .update({
      status: "CHECKED_IN",
      checked_in_at: now,
    })
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
  await (adminDb.from("checkins") as any).insert({
    ticket_id: ticket.id,
    event_id: ticket.event_id,
    checked_in_at: now,
  });

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

