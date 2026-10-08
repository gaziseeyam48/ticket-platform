import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { generateSecureToken, hashToken, generateTicketNumber } from "@/lib/utils/crypto";
import { generateQrCodeDataUrl, buildTicketUrl } from "@/lib/services/qr.service";
import { sendTicketEmail } from "@/lib/services/email.service";
import { format } from "date-fns";

export interface IssueTicketParams {
  eventId: string;
  participantName: string;
  participantEmail: string;
  registrationId?: string | null;
  participantData?: Record<string, unknown> | null;
  issuedBy?: string | null; // Admin UUID if manual, null if automatic
}

export interface IssuedTicketResult {
  ticket: {
    id: string;
    event_id: string;
    registration_id: string | null;
    ticket_number: string;
    status: string;
    participant_name: string;
    participant_email: string;
    issued_at: string;
  };
  rawToken: string;
  ticketUrl: string;
  qrCodeDataUrl: string;
  emailSent: boolean;
}

/**
 * Unified, idempotent ticket issuance service.
 * Used for:
 * - Free event registration automatic issuance
 * - Paid event approval issuance
 * - Organizer direct ticket issuance
 */
export async function issueTicket(params: IssueTicketParams): Promise<IssuedTicketResult> {
  const { eventId, participantName, participantEmail, registrationId, participantData, issuedBy } = params;

  const adminDb = getAdminClient();
  const normalizedEmail = participantEmail.trim().toLowerCase();

  // 1. Idempotency Check: if registrationId provided, check if ticket already issued
  if (registrationId) {
    const { data: existingTicket } = await (adminDb
      .from("tickets")
      .select("*")
      .eq("registration_id", registrationId)
      .maybeSingle() as any);

    if (existingTicket) {
      // Re-generate a fresh temporary QR code payload for display
      const placeholderToken = generateSecureToken(16);
      const ticketUrl = buildTicketUrl(placeholderToken);
      const qrCodeDataUrl = await generateQrCodeDataUrl(ticketUrl);

      return {
        ticket: existingTicket,
        rawToken: placeholderToken,
        ticketUrl,
        qrCodeDataUrl,
        emailSent: true,
      };
    }
  }

  // 2. Fetch Event details for email template and metadata
  const { data: event, error: eventError } = await (adminDb
    .from("events")
    .select("id, name, slug, status, date_start, date_end, location")
    .eq("id", eventId)
    .single() as any);

  if (eventError || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found for ticket issuance.");
  }

  // 3. Generate cryptographic token, token hash, and ticket number
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const ticketNumber = generateTicketNumber("TKT");

  // 4. Insert ticket record into the database
  const { data: ticket, error: insertError } = await ((adminDb as any)
    .from("tickets")
    .insert([
      {
        event_id: eventId,
        registration_id: registrationId || null,
        ticket_number: ticketNumber,
        token_hash: tokenHash,
        status: "ISSUED",
        participant_name: participantName.trim(),
        participant_email: normalizedEmail,
        participant_data: participantData || null,
        issued_by: issuedBy || null,
        issued_at: new Date().toISOString(),
      },
    ])
    .select()
    .single() as any);

  if (insertError) {
    console.error("Error creating ticket:", insertError);
    if (insertError.code === "23505") { // Unique violation for ticket_number or token_hash
      throw new AppError(ERROR_CODES.TICKET_ALREADY_ISSUED, "A ticket with these credentials already exists.");
    }
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to issue ticket record.");
  }

  // 5. Generate QR code encoding the public ticket URL
  const ticketUrl = buildTicketUrl(rawToken);
  const qrCodeDataUrl = await generateQrCodeDataUrl(ticketUrl);

  // 6. Format event date for email
  let formattedDate: string | null = null;
  if (event.date_start) {
    formattedDate = format(new Date(event.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a");
    if (event.date_end) {
      formattedDate += ` - ${format(new Date(event.date_end), "h:mm a")}`;
    }
  }

  // 7. Dispatch Ticket Email (Graceful failure: email failure does NOT abort ticket issuance)
  let emailSent = false;
  try {
    const emailResult = await sendTicketEmail({
      to: normalizedEmail,
      participantName: participantName.trim(),
      eventName: event.name,
      ticketNumber,
      eventDate: formattedDate,
      eventLocation: event.location,
      ticketUrl,
      qrCodeDataUrl,
    });
    emailSent = emailResult.success;
  } catch (emailErr) {
    console.warn("Could not send ticket email immediately:", emailErr);
  }

  return {
    ticket,
    rawToken,
    ticketUrl,
    qrCodeDataUrl,
    emailSent,
  };
}
