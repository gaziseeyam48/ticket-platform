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
