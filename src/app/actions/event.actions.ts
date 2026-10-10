"use server";

import { createServerDbClient as createClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { createEventSchema, updateEventSchema, updateEventStatusSchema } from "@/lib/validations/event";
import { logAuditEvent } from "@/lib/services/audit.service";
import { revalidatePath } from "next/cache";

async function verifyOrgMembership(adminDb: any, organizationId: string, userId: string) {
  const { data: membership } = await adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!membership;
}

export async function createEvent(organizationId: string, formData: FormData) {
  const supabase = await createClient();

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to create an event.");
  }

  const adminDb = getAdminClient();
  const isMember = await verifyOrgMembership(adminDb, organizationId, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have permission to create events in this organization.");
  }

  // Parse form data
  const eventType = formData.get("event_type")?.toString() || "FREE";
  const rawData: any = {
    name: formData.get("name")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    description: formData.get("description")?.toString() || undefined,
    event_type: eventType,
    date_start: formData.get("date_start")?.toString() || undefined,
    date_end: formData.get("date_end")?.toString() || undefined,
    location: formData.get("location")?.toString() || undefined,
  };

  if (eventType === "PAID") {
    rawData.payment_config = {
      payment_method: formData.get("payment_method")?.toString() || "",
      account_number: formData.get("account_number")?.toString() || "",
      account_name: formData.get("account_name")?.toString() || "",
      amount: formData.get("amount")?.toString() || "",
      currency: formData.get("currency")?.toString() || "USD",
      instructions: formData.get("instructions")?.toString() || "",
    };
  } else {
    rawData.payment_config = null;
  }

  const validationResult = createEventSchema.safeParse(rawData);

  if (!validationResult.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Invalid event data", { details: validationResult.error.format() });
  }

  const data = validationResult.data;

  // Insert event
  const { data: event, error } = await ((adminDb as any)
    .from("events")
    .insert([
      {
        organization_id: organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        event_type: data.event_type as any,
        date_start: data.date_start ? new Date(data.date_start).toISOString() : null,
        date_end: data.date_end ? new Date(data.date_end).toISOString() : null,
        location: data.location,
        status: "DRAFT",
        payment_config: data.event_type === "PAID" ? data.payment_config : null,
      },
    ])
    .select()
    .single() as any);

  if (error) {
    if (error.code === "23505") { // Unique violation for slug
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "An event with this slug already exists in your organization.");
    }
    console.error("Error creating event:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to create event.");
  }

  // Automatically initialize default registration form with Name and Email
  await (adminDb as any)
    .from("registration_forms")
    .insert([
      {
        event_id: event.id,
        fields: [
          {
            id: "field_name",
            type: "text",
            label: "Full Name",
            placeholder: "e.g. Jane Doe",
            required: true,
            options: [],
            order: 0,
            isSystem: true,
          },
          {
            id: "field_email",
            type: "email",
            label: "Email Address",
            placeholder: "e.g. jane@example.com",
            required: true,
            options: [],
            order: 1,
            isSystem: true,
          },
        ],
      },
    ]);

  await logAuditEvent({
    organizationId,
    eventId: event.id,
    actorId: user.id,
    actorType: "USER",
    action: "EVENT_CREATED",
    targetType: "EVENT",
    targetId: event.id,
    metadata: {
      name: event.name,
      slug: event.slug,
      event_type: event.event_type,
    },
  });

  revalidatePath("/org/events");
  revalidatePath("/org");
  
  return event;
}

export async function getEvents(organizationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();
  const isMember = await verifyOrgMembership(adminDb, organizationId, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have access to this organization's events.");
  }

  const { data: events, error } = await (adminDb
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false }) as any);
    
  if (error) {
    console.error("Error fetching events:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch events.");
  }
  
  return events || [];
}

export async function getEventById(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();
  const { data: event, error } = await (adminDb
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single() as any);
    
  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
    }
    console.error("Error fetching event:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch event.");
  }

  const isMember = await verifyOrgMembership(adminDb, event.organization_id, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have permission to access this event.");
  }
  
  return event;
}

export async function getEventBySlug(slug: string) {
  const adminDb = getAdminClient();
  
  const { data: event, error } = await (adminDb
    .from("events")
    .select("*, organizations(name, slug)")
    .eq("slug", slug)
    .single() as any);
    
  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
    }
    console.error("Error fetching event by slug:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch event.");
  }
  
  return event;
}

export async function updateEventStatus(eventId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }
  
  const validationResult = updateEventStatusSchema.safeParse({ status });
  if (!validationResult.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Invalid status.");
  }

  const adminDb = getAdminClient();
  const { data: existingEvent } = await (adminDb
    .from("events")
    .select("organization_id, status")
    .eq("id", eventId)
    .single() as any);

  if (!existingEvent) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const isMember = await verifyOrgMembership(adminDb, existingEvent.organization_id, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const targetStatus = validationResult.data.status;

  // 1. Guard terminal states: ENDED and CANCELLED cannot be restarted
  if (existingEvent.status === "ENDED" || existingEvent.status === "CANCELLED") {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Event has reached terminal state "${existingEvent.status}" and cannot be transitioned.`
    );
  }

  // 2. Validate prerequisites for PUBLISHED and LIVE states
  if (targetStatus === "PUBLISHED" || targetStatus === "LIVE") {
    const { data: form } = await (adminDb
      .from("registration_forms")
      .select("fields")
      .eq("event_id", eventId)
      .maybeSingle() as any);

    if (!form || !Array.isArray(form.fields) || form.fields.length === 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `Cannot ${targetStatus === "LIVE" ? "start" : "publish"} event: Please configure registration form questions first.`
      );
    }
  }

  // 3. Perform event status update
  const { data: event, error } = await ((adminDb as any)
    .from("events")
    .update({ status: targetStatus })
    .eq("id", eventId)
    .select()
    .single() as any);
    
  if (error) {
    console.error("Error updating event status:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update event status.");
  }

  // 4. When ending the event, auto-expire active gate verifier credentials
  if (targetStatus === "ENDED") {
    try {
      await ((adminDb as any)
        .from("event_verifiers")
        .update({ status: "EXPIRED" })
        .eq("event_id", eventId)
        .in("status", ["ACTIVE", "INVITED"]));
    } catch (verErr) {
      console.warn("Could not expire verifiers on event end:", verErr);
    }
  }

  // 5. Audit record logging
  const auditAction =
    targetStatus === "LIVE"
      ? "EVENT_STARTED"
      : targetStatus === "ENDED"
      ? "EVENT_ENDED"
      : targetStatus === "PUBLISHED"
      ? "EVENT_PUBLISHED"
      : targetStatus === "CANCELLED"
      ? "EVENT_CANCELLED"
      : `EVENT_STATUS_${targetStatus}`;

  await logAuditEvent({
    organizationId: existingEvent.organization_id,
    eventId: eventId,
    actorId: user.id,
    actorType: "USER",
    action: auditAction,
    targetType: "EVENT",
    targetId: eventId,
    metadata: {
      previous_status: existingEvent.status,
      new_status: targetStatus,
    },
  });
  
  revalidatePath(`/org/events/${eventId}`);
  revalidatePath("/org/events");
  revalidatePath("/org");
  revalidatePath("/verify");
  
  return event;
}

/**
 * Dedicated action to transition an event to LIVE (starts the event and opens entrance verification).
 */
export async function startEvent(eventId: string) {
  return updateEventStatus(eventId, "LIVE");
}

/**
 * Dedicated action to transition an event to ENDED (closes public entrance gates and registration).
 */
export async function endEvent(eventId: string) {
  return updateEventStatus(eventId, "ENDED");
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to update an event.");
  }

  const adminDb = getAdminClient();
  const { data: existingEvent } = await (adminDb
    .from("events")
    .select("organization_id")
    .eq("id", eventId)
    .single() as any);

  if (!existingEvent) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const isMember = await verifyOrgMembership(adminDb, existingEvent.organization_id, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const eventType = formData.get("event_type")?.toString();
  const rawData: any = {
    name: formData.get("name")?.toString() || undefined,
    slug: formData.get("slug")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    event_type: eventType || undefined,
    date_start: formData.get("date_start")?.toString() || undefined,
    date_end: formData.get("date_end")?.toString() || undefined,
    location: formData.get("location")?.toString() || undefined,
  };

  if (eventType === "PAID") {
    rawData.payment_config = {
      payment_method: formData.get("payment_method")?.toString() || "",
      account_number: formData.get("account_number")?.toString() || "",
      account_name: formData.get("account_name")?.toString() || "",
      amount: formData.get("amount")?.toString() || "",
      currency: formData.get("currency")?.toString() || "USD",
      instructions: formData.get("instructions")?.toString() || "",
    };
  } else if (eventType === "FREE") {
    rawData.payment_config = null;
  }

  const validationResult = updateEventSchema.safeParse(rawData);

  if (!validationResult.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Invalid event data", { details: validationResult.error.format() });
  }

  const data = validationResult.data;

  // Format dates
  const updateData: any = { ...data };
  if (data.date_start) updateData.date_start = new Date(data.date_start).toISOString();
  else if (data.date_start === "") updateData.date_start = null;
  if (data.date_end) updateData.date_end = new Date(data.date_end).toISOString();
  else if (data.date_end === "") updateData.date_end = null;

  if (eventType === "PAID") {
    updateData.payment_config = data.payment_config;
  } else if (eventType === "FREE") {
    updateData.payment_config = null;
  }

  const { data: event, error } = await ((adminDb as any)
    .from("events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single() as any);

  if (error) {
    if (error.code === "23505") {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "An event with this slug already exists.");
    }
    console.error("Error updating event:", error.message || error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update event.");
  }

  await logAuditEvent({
    organizationId: existingEvent.organization_id,
    eventId: event.id,
    actorId: user.id,
    actorType: "USER",
    action: "EVENT_UPDATED",
    targetType: "EVENT",
    targetId: event.id,
    metadata: {
      name: event.name,
      slug: event.slug,
      event_type: event.event_type,
    },
  });

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath("/org/events");
  revalidatePath("/org");
  
  return event;
}
