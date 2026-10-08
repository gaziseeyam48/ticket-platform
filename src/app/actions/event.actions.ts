"use server";

import { createServerDbClient as createClient } from "@/lib/db/server";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { createEventSchema, updateEventSchema, updateEventStatusSchema } from "@/lib/validations/event";
import { revalidatePath } from "next/cache";

export async function createEvent(organizationId: string, formData: FormData) {
  const supabase = await createClient();

  // Validate session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to create an event.");
  }

  // Parse form data
  const rawData = {
    name: formData.get("name")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    description: formData.get("description")?.toString() || undefined,
    event_type: formData.get("event_type")?.toString() || "FREE",
    date_start: formData.get("date_start")?.toString() || undefined,
    date_end: formData.get("date_end")?.toString() || undefined,
    location: formData.get("location")?.toString() || undefined,
  };

  const validationResult = createEventSchema.safeParse(rawData);

  if (!validationResult.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Invalid event data", { details: validationResult.error.format() });
  }

  const data = validationResult.data;

  // Insert event
  const { data: event, error } = await ((supabase as any)
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
      },
    ])
    .select()
    .single() as any);

  if (error) {
    if (error.code === "23505") { // Unique violation for slug
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "An event with this slug already exists in your organization.");
    }
    console.error("Error creating event:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to create event.");
  }

  // Automatically initialize default registration form with Name and Email
  await (supabase as any)
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

  revalidatePath("/org/events");
  
  return event;
}

export async function getEvents(organizationId: string) {
  const supabase = await createClient();
  
  const { data: events, error } = await (supabase
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false }) as any);
    
  if (error) {
    console.error("Error fetching events:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch events.");
  }
  
  return events;
}

export async function getEventById(eventId: string) {
  const supabase = await createClient();
  
  const { data: event, error } = await (supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single() as any);
    
  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
    }
    console.error("Error fetching event:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch event.");
  }
  
  return event;
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data: event, error } = await (supabase
    .from("events")
    .select("*, organizations(name, slug)")
    .eq("slug", slug)
    .single() as any);
    
  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
    }
    console.error("Error fetching event by slug:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to fetch event.");
  }
  
  return event;
}

export async function updateEventStatus(eventId: string, status: string) {
  const supabase = await createClient();
  
  const validationResult = updateEventStatusSchema.safeParse({ status });
  if (!validationResult.success) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Invalid status.");
  }

  if (validationResult.data.status === "PUBLISHED") {
    const { data: form } = await (supabase
      .from("registration_forms")
      .select("fields")
      .eq("event_id", eventId)
      .maybeSingle() as any);

    if (!form || !Array.isArray(form.fields) || form.fields.length === 0) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Cannot publish event: Please configure the registration form first."
      );
    }
  }
  
  const { data: event, error } = await ((supabase as any)
    .from("events")
    .update({ status: validationResult.data.status })
    .eq("id", eventId)
    .select()
    .single() as any);
    
  if (error) {
    console.error("Error updating event status:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update event status.");
  }
  
  revalidatePath(`/org/events/${eventId}`);
  revalidatePath("/org/events");
  
  return event;
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in to update an event.");
  }

  const rawData = {
    name: formData.get("name")?.toString() || undefined,
    slug: formData.get("slug")?.toString() || undefined,
    description: formData.get("description")?.toString() || undefined,
    event_type: formData.get("event_type")?.toString() || undefined,
    date_start: formData.get("date_start")?.toString() || undefined,
    date_end: formData.get("date_end")?.toString() || undefined,
    location: formData.get("location")?.toString() || undefined,
  };

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

  const { data: event, error } = await ((supabase as any)
    .from("events")
    .update(updateData)
    .eq("id", eventId)
    .select()
    .single() as any);

  if (error) {
    if (error.code === "23505") {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "An event with this slug already exists.");
    }
    console.error("Error updating event:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update event.");
  }

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath("/org/events");
  
  return event;
}
