"use server";

import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { rateLimiter } from "@/lib/utils/rate-limiter";
import { validateSubmissionData, FormField } from "@/lib/validations/form";
import { issueTicket } from "@/lib/services/ticket.service";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface PublicEventData {
  event: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    date_end?: string | null;
    location?: string | null;
    status: string;
    payment_config?: {
      payment_method?: string;
      account_number?: string;
      account_name?: string;
      amount?: string;
      currency?: string;
      instructions?: string;
    } | null;
    organizations: {
      name: string;
      slug: string;
    };
  };
  form: {
    id: string;
    fields: FormField[];
  } | null;
  isOpen: boolean;
  statusMessage?: string;
}

/**
 * Loads public event and registration form data for the public registration page.
 */
export async function getPublicEventRegistrationData(slug: string): Promise<PublicEventData> {
  const adminDb = getAdminClient();

  // Fetch event
  const { data: event, error: eventError } = await (adminDb
    .from("events")
    .select("id, name, slug, description, event_type, date_start, date_end, location, status, payment_config, organizations(name, slug)")
    .eq("slug", slug)
    .single() as any);

  if (eventError || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  // Determine registration status
  let isOpen = true;
  let statusMessage = "Registration is open.";

  if (event.status === "DRAFT") {
    isOpen = false;
    statusMessage = "This event is currently in draft mode and not accepting registrations.";
  } else if (event.status === "ENDED") {
    isOpen = false;
    statusMessage = "This event has already ended. Registration is closed.";
  } else if (event.status === "CANCELLED") {
    isOpen = false;
    statusMessage = "This event has been cancelled.";
  }

  // Fetch registration form
  const { data: form } = await (adminDb
    .from("registration_forms")
    .select("id, fields")
    .eq("event_id", event.id)
    .maybeSingle() as any);

  return {
    event,
    form,
    isOpen,
    statusMessage,
  };
}

/**
 * Handles public participant registration submission.
 * Validates inputs against dynamic form schema, performs duplicate detection,
 * enforces rate limits and honeypot bot protection.
 */
export async function submitRegistration(
  slug: string,
  submission: Record<string, unknown>,
  honeypot?: string
) {
  // 1. Anti-abuse honeypot check
  if (honeypot && honeypot.trim().length > 0) {
    // Silently reject or simulate success for bots
    return {
      success: true,
      registrationId: "mock-id",
      eventType: "FREE",
      participantName: "Guest",
      email: "guest@example.com",
    };
  }

  // 2. IP-based rate limiting
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  const rateCheck = rateLimiter.check(`registration:${ip}`, 12, 60_000);
  if (!rateCheck.allowed) {
    throw new AppError(
      ERROR_CODES.RATE_LIMITED,
      "Too many registration requests from your network. Please wait a minute before trying again."
    );
  }

  const adminDb = getAdminClient();

  // 3. Look up event and verify status
  const { data: event, error: eventError } = await (adminDb
    .from("events")
    .select("id, name, slug, event_type, status, payment_config")
    .eq("slug", slug)
    .single() as any);

  if (eventError || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  if (event.status !== "PUBLISHED" && event.status !== "LIVE") {
    const message =
      event.status === "ENDED"
        ? "Registration is closed because this event has already concluded."
        : event.status === "CANCELLED"
        ? "This event has been cancelled."
        : "Registration is not currently open for this event.";

    throw new AppError(ERROR_CODES.EVENT_NOT_ACCEPTING, message);
  }

  // 4. Look up registration form
  const { data: form, error: formError } = await (adminDb
    .from("registration_forms")
    .select("id, fields")
    .eq("event_id", event.id)
    .single() as any);

  if (formError || !form || !Array.isArray(form.fields)) {
    throw new AppError(
      ERROR_CODES.INTERNAL_ERROR,
      "Registration form configuration is missing for this event."
    );
  }

  const fields: FormField[] = form.fields;

  // 5. Server-side validation against dynamic form schema
  const validation = validateSubmissionData(fields, submission);
  if (!validation.isValid) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Please fill out all required fields correctly.",
      { details: validation.errors }
    );
  }

  // 6. Extract Email and Participant Name
  const emailField = fields.find((f) => f.type === "email") || fields.find((f) => f.id === "field_email");
  const nameField = fields.find((f) => f.id === "field_name") || fields.find((f) => f.type === "text" && f.required);

  const rawEmail = emailField ? submission[emailField.id] : undefined;
  const rawName = nameField ? submission[nameField.id] : undefined;

  if (!rawEmail || typeof rawEmail !== "string") {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "A valid email address is required.");
  }

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const participantName = rawName && typeof rawName === "string" ? rawName.trim() : "Participant";

  // 7. Duplicate registration check (one registration per email per event)
  const { data: existingReg } = await (adminDb
    .from("registrations")
    .select("id, email, status")
    .eq("event_id", event.id)
    .eq("email", normalizedEmail)
    .maybeSingle() as any);

  if (existingReg) {
    throw new AppError(
      ERROR_CODES.DUPLICATE_REGISTRATION,
      `The email address ${normalizedEmail} is already registered for this event.`
    );
  }

  // 8. Insert new registration record
  const initialPaymentStatus = event.event_type === "PAID" ? "PENDING" : null;

  const { data: newRegistration, error: insertError } = await ((adminDb as any)
    .from("registrations")
    .insert([
      {
        event_id: event.id,
        form_id: form.id,
        email: normalizedEmail,
        participant_name: participantName,
        status: "REGISTERED",
        form_data: submission,
        payment_status: initialPaymentStatus,
      },
    ])
    .select()
    .single() as any);

  if (insertError) {
    if (insertError.code === "23505") {
      throw new AppError(
        ERROR_CODES.DUPLICATE_REGISTRATION,
        `The email address ${normalizedEmail} is already registered for this event.`
      );
    }
    console.error("Failed to create registration:", insertError);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to complete registration. Please try again.");
  }

  // 9. Automatically issue ticket immediately for FREE events
  let ticketPayload: { ticketNumber: string; ticketUrl: string; qrCodeDataUrl: string } | null = null;
  if (event.event_type === "FREE") {
    try {
      const ticketResult = await issueTicket({
        eventId: event.id,
        participantName,
        participantEmail: normalizedEmail,
        registrationId: newRegistration.id,
        participantData: submission,
      });

      ticketPayload = {
        ticketNumber: ticketResult.ticket.ticket_number,
        ticketUrl: ticketResult.ticketUrl,
        qrCodeDataUrl: ticketResult.qrCodeDataUrl,
      };
    } catch (ticketError) {
      console.error("Automatic ticket issuance error for free event:", ticketError);
      // Registration is preserved; ticket can be issued/retried
    }
  }

  revalidatePath(`/events/${slug}`);
  revalidatePath(`/events/${slug}/register`);

  return {
    success: true,
    registrationId: newRegistration.id,
    eventType: event.event_type,
    participantName,
    email: normalizedEmail,
    eventName: event.name,
    paymentConfig: event.payment_config || null,
    ticket: ticketPayload,
  };
}

/**
 * Submits transaction ID for a paid event registration.
 */
export async function submitPaymentTransaction(
  registrationId: string,
  transactionId: string
) {
  if (!transactionId || transactionId.trim().length === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Transaction ID is required.");
  }

  const adminDb = getAdminClient();

  // Verify registration
  const { data: reg, error: regError } = await (adminDb
    .from("registrations")
    .select("id, payment_status, event_id")
    .eq("id", registrationId)
    .single() as any);

  if (regError || !reg) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Registration not found.");
  }

  // Update payment status to SUBMITTED
  const { data: updatedReg, error: updateError } = await ((adminDb as any)
    .from("registrations")
    .update({
      payment_status: "SUBMITTED",
      transaction_id: transactionId.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .select()
    .single() as any);

  if (updateError) {
    console.error("Error submitting transaction ID:", updateError);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to submit transaction details.");
  }

  return {
    success: true,
    registrationId: updatedReg.id,
    paymentStatus: updatedReg.payment_status,
  };
}
