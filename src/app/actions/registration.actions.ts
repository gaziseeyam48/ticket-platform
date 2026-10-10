"use server";

import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { rateLimiter } from "@/lib/utils/rate-limiter";
import { validateSubmissionData, FormField } from "@/lib/validations/form";
import { issueTicket } from "@/lib/services/ticket.service";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  canSubmitTransaction,
  assertValidPaymentTransition,
  isValidPaymentTransition,
} from "@/lib/utils/payment-state";
import { logAuditEvent } from "@/lib/services/audit.service";

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

export type SubmitRegistrationResult =
  | {
      success: true;
      registrationId: string;
      eventType: "FREE" | "PAID";
      participantName: string;
      email: string;
      eventName: string;
      paymentConfig: any;
      ticket: { ticketNumber: string; ticketUrl: string; qrCodeDataUrl: string } | null;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export type SubmitPaymentTransactionResult =
  | {
      success: true;
      registrationId: string;
      paymentStatus: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Handles public participant registration submission.
 * Validates inputs against dynamic form schema, performs duplicate detection,
 * enforces rate limits and honeypot bot protection.
 */
export async function submitRegistration(
  slug: string,
  submission: Record<string, unknown>,
  honeypot?: string
): Promise<SubmitRegistrationResult> {
  try {
    // 1. Anti-abuse honeypot check
    if (honeypot && honeypot.trim().length > 0) {
      // Silently reject or simulate success for bots
      return {
        success: true,
        registrationId: "mock-id",
        eventType: "FREE",
        participantName: "Guest",
        email: "guest@example.com",
        eventName: "Event",
        paymentConfig: null,
        ticket: null,
      };
    }

    // 2. IP-based rate limiting
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateCheck = rateLimiter.check(`registration:${ip}`, 12, 60_000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: "Too many registration requests from your network. Please wait a minute before trying again.",
      };
    }

    const adminDb = getAdminClient();

    // 3. Look up event and verify status
    const { data: event, error: eventError } = await (adminDb
      .from("events")
      .select("id, name, slug, event_type, status, payment_config, organization_id")
      .eq("slug", slug)
      .single() as any);

    if (eventError || !event) {
      return {
        success: false,
        error: "Event not found.",
      };
    }

    if (event.status !== "PUBLISHED" && event.status !== "LIVE") {
      const message =
        event.status === "ENDED"
          ? "Registration is closed because this event has already concluded."
          : event.status === "CANCELLED"
          ? "This event has been cancelled."
          : "Registration is not currently open for this event.";

      return {
        success: false,
        error: message,
      };
    }

    // 4. Look up registration form
    const { data: form, error: formError } = await (adminDb
      .from("registration_forms")
      .select("id, fields")
      .eq("event_id", event.id)
      .single() as any);

    if (formError || !form || !Array.isArray(form.fields)) {
      return {
        success: false,
        error: "Registration form configuration is missing for this event.",
      };
    }

    const fields: FormField[] = form.fields;

    // 5. Server-side validation against dynamic form schema
    const validation = validateSubmissionData(fields, submission);
    if (!validation.isValid) {
      return {
        success: false,
        error: "Please fill out all required fields correctly.",
        fieldErrors: validation.errors,
      };
    }

    // 6. Extract Email and Participant Name
    const emailField = fields.find((f) => f.type === "email") || fields.find((f) => f.id === "field_email");
    const nameField = fields.find((f) => f.id === "field_name") || fields.find((f) => f.type === "text" && f.required);

    const rawEmail = emailField ? submission[emailField.id] : undefined;
    const rawName = nameField ? submission[nameField.id] : undefined;

    if (!rawEmail || typeof rawEmail !== "string") {
      return {
        success: false,
        error: "A valid email address is required.",
      };
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
      return {
        success: false,
        error: `The email address ${normalizedEmail} is already registered for this event.`,
      };
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
        return {
          success: false,
          error: `The email address ${normalizedEmail} is already registered for this event.`,
        };
      }
      console.error("Failed to create registration:", insertError);
      return {
        success: false,
        error: "Failed to complete registration. Please try again.",
      };
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

    await logAuditEvent({
      organizationId: event.organization_id || null,
      eventId: event.id,
      actorId: null,
      actorType: "SYSTEM",
      action: "REGISTRATION_CREATED",
      targetType: "REGISTRATION",
      targetId: newRegistration.id,
      metadata: {
        participant_name: participantName,
        email: normalizedEmail,
        event_type: event.event_type,
      },
    });

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
  } catch (error: unknown) {
    console.error("Unexpected error in submitRegistration:", error);
    const msg = error instanceof Error ? error.message : "Failed to complete registration. Please try again.";
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Submits transaction ID for a paid event registration.
 */
export async function submitPaymentTransaction(
  registrationId: string,
  transactionId: string
): Promise<SubmitPaymentTransactionResult> {
  try {
    if (!transactionId || transactionId.trim().length === 0) {
      return {
        success: false,
        error: "Transaction ID is required.",
      };
    }

    const adminDb = getAdminClient();

    // Verify registration
    const { data: reg, error: regError } = await (adminDb
      .from("registrations")
      .select("id, payment_status, event_id")
      .eq("id", registrationId)
      .single() as any);

    if (regError || !reg) {
      return {
        success: false,
        error: "Registration not found.",
      };
    }

    if (!canSubmitTransaction(reg.payment_status)) {
      return {
        success: false,
        error: "Payment is already approved. Cannot submit or modify transaction identifier.",
      };
    }

    assertValidPaymentTransition(reg.payment_status, "SUBMITTED");

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
      return {
        success: false,
        error: "Failed to submit transaction details.",
      };
    }

    await logAuditEvent({
      eventId: reg.event_id,
      actorType: "USER",
      action: "PAYMENT_SUBMITTED",
      targetType: "REGISTRATION",
      targetId: registrationId,
      metadata: {
        transaction_id: transactionId.trim(),
      },
    });

    return {
      success: true,
      registrationId: updatedReg.id,
      paymentStatus: updatedReg.payment_status,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in submitPaymentTransaction:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit transaction details.";
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Organizer action: review (approve or reject) a participant's payment submission.
 * Approving immediately generates and issues a digital entrance pass.
 */
export async function reviewRegistrationPayment(
  registrationId: string,
  action: "APPROVE" | "REJECT"
) {
  const { createServerDbClient } = await import("@/lib/db/server");
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();
  const { data: reg, error: regError } = await (adminDb
    .from("registrations")
    .select("id, participant_name, email, payment_status, event_id, events(id, organization_id, name)")
    .eq("id", registrationId)
    .single() as any);

  if (regError || !reg) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Registration not found.");
  }

  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", reg.events.organization_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const targetStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

  if (!isValidPaymentTransition(reg.payment_status, targetStatus)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Cannot transition payment status from ${reg.payment_status || "PENDING"} to ${targetStatus}.`
    );
  }

  const now = new Date().toISOString();
  const previousStatus = reg.payment_status;

  if (action === "APPROVE") {
    // 1. Mark status as APPROVED
    const { error: approvalError } = await ((adminDb as any)
      .from("registrations")
      .update({
        payment_status: "APPROVED",
        payment_reviewed_by: user.id,
        payment_reviewed_at: now,
      })
      .eq("id", registrationId));

    if (approvalError) {
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update payment approval status.");
    }

    // 2. Automatically generate and issue entrance pass with rollback safety
    try {
      await issueTicket({
        eventId: reg.event_id,
        participantName: reg.participant_name,
        participantEmail: reg.email,
        registrationId: reg.id,
        issuedBy: user.id,
      });
    } catch (ticketError) {
      console.error("Failed to issue entrance pass on approval, reverting status:", ticketError);
      // Safe rollback so system does not hold an approved state without a valid pass
      await ((adminDb as any)
        .from("registrations")
        .update({
          payment_status: previousStatus || "SUBMITTED",
          payment_reviewed_by: null,
          payment_reviewed_at: null,
        })
        .eq("id", registrationId));

      throw new AppError(
        ERROR_CODES.INTERNAL_ERROR,
        "Failed to generate entrance pass. Payment review reverted to allow re-trying."
      );
    }
  } else {
    const { error: rejectError } = await ((adminDb as any)
      .from("registrations")
      .update({
        payment_status: "REJECTED",
        payment_reviewed_by: user.id,
        payment_reviewed_at: now,
      })
      .eq("id", registrationId));

    if (rejectError) {
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to reject payment.");
    }
  }

  await logAuditEvent({
    organizationId: reg.events.organization_id,
    eventId: reg.event_id,
    actorId: user.id,
    actorType: "USER",
    action: action === "APPROVE" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
    targetType: "REGISTRATION",
    targetId: registrationId,
    metadata: {
      participant_name: reg.participant_name,
      email: reg.email,
      transaction_id: reg.transaction_id,
      action,
    },
  });

  revalidatePath(`/org/events/${reg.event_id}`);
  return { success: true };
}
