"use server";

import { createServerDbClient as createClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import {
  DEFAULT_FORM_FIELDS,
  FormField,
  registrationFormSchema,
} from "@/lib/validations/form";
import { revalidatePath } from "next/cache";

async function verifyEventOrgMembership(adminDb: any, eventId: string, userId: string) {
  const { data: event } = await adminDb
    .from("events")
    .select("id, organization_id, slug, status")
    .eq("id", eventId)
    .single();

  if (!event) {
    return { event: null, isMember: false };
  }

  const { data: membership } = await adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", event.organization_id)
    .eq("user_id", userId)
    .maybeSingle();

  return { event, isMember: !!membership };
}

/**
 * Retrieves the registration form schema for an event.
 * If no form exists yet, creates one with the default fields.
 */
export async function getRegistrationForm(eventId: string) {
  const supabase = await createClient();

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to view form settings.");
  }

  const adminDb = getAdminClient();
  const { event, isMember } = await verifyEventOrgMembership(adminDb, eventId, user.id);

  if (!event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have permission to view form settings.");
  }

  // Fetch form
  const { data: form, error } = await (adminDb
    .from("registration_forms")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle() as any);

  if (error) {
    console.error("Error fetching registration form:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch registration form.");
  }

  if (!form) {
    // If not found, insert default form
    const { data: newForm, error: insertError } = await ((adminDb as any)
      .from("registration_forms")
      .insert([
        {
          event_id: eventId,
          fields: DEFAULT_FORM_FIELDS,
        },
      ])
      .select()
      .single() as any);

    if (insertError) {
      console.error("Error creating default registration form:", insertError.message || insertError);
      // Fallback: return virtual default form
      return {
        id: "default",
        event_id: eventId,
        fields: DEFAULT_FORM_FIELDS,
      };
    }

    return newForm;
  }

  return form;
}

/**
 * Saves/updates the registration form schema for an event.
 */
export async function saveRegistrationForm(eventId: string, fields: FormField[]) {
  const supabase = await createClient();

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to update the form.");
  }

  const adminDb = getAdminClient();
  const { event, isMember } = await verifyEventOrgMembership(adminDb, eventId, user.id);

  if (!event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  if (!isMember) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      "You do not have permission to modify this event's form."
    );
  }

  // Validate form fields schema with Zod
  const validationResult = registrationFormSchema.safeParse({ fields });

  if (!validationResult.success) {
    const errorDetails = validationResult.error.format();
    const firstErrorMessage = validationResult.error.issues[0]?.message || "Invalid form configuration.";
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, firstErrorMessage, {
      details: errorDetails,
    });
  }

  // Normalize order property on fields
  const normalizedFields = validationResult.data.fields.map((f, index) => ({
    ...f,
    order: index,
  }));

  // Upsert form schema into database
  const { data: updatedForm, error: updateError } = await ((adminDb as any)
    .from("registration_forms")
    .upsert(
      {
        event_id: eventId,
        fields: normalizedFields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_id" }
    )
    .select()
    .single() as any);

  if (updateError) {
    console.error("Error saving registration form:", updateError.message || updateError);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to save registration form.");
  }

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath(`/org/events/${eventId}/form`);
  revalidatePath(`/events/${event.slug}`);

  return updatedForm;
}
