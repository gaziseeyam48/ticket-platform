"use server";

import { createServerDbClient as createClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import {
  TicketDesignConfig,
  DEFAULT_TICKET_DESIGN,
  ticketDesignSchema,
} from "@/lib/types/ticket-design";
import { logAuditEvent } from "@/lib/services/audit.service";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";

async function verifyOrgMembership(adminDb: any, organizationId: string, userId: string) {
  const { data: membership } = await adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!membership;
}

/**
 * Retrieves the saved ticket design configuration for an event.
 */
export async function getTicketDesign(eventId: string): Promise<TicketDesignConfig> {
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
    .select("id, organization_id, settings")
    .eq("id", eventId)
    .single() as any);

  if (error || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const isMember = await verifyOrgMembership(adminDb, event.organization_id, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have access to this event.");
  }

  const settings = event.settings || {};
  const savedDesign = settings.ticket_design;

  if (!savedDesign) {
    return DEFAULT_TICKET_DESIGN;
  }

  const parseResult = ticketDesignSchema.safeParse(savedDesign);
  return parseResult.success ? (parseResult.data as TicketDesignConfig) : DEFAULT_TICKET_DESIGN;
}

/**
 * Saves and validates a customized ticket design for an event.
 */
export async function saveTicketDesign(eventId: string, config: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  // 1. Strict server-side schema validation
  const validation = ticketDesignSchema.safeParse(config);
  if (!validation.success) {
    const errorDetails = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, `Invalid ticket design: ${errorDetails}`);
  }

  const validatedDesign: TicketDesignConfig = {
    ...validation.data,
    updatedAt: new Date().toISOString(),
  };

  const adminDb = getAdminClient();
  const { data: event, error: eventErr } = await (adminDb
    .from("events")
    .select("id, organization_id, name, settings")
    .eq("id", eventId)
    .single() as any);

  if (eventErr || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const isMember = await verifyOrgMembership(adminDb, event.organization_id, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "You do not have access to this event.");
  }

  // 2. Merge into event settings JSONB
  const currentSettings = event.settings || {};
  const updatedSettings = {
    ...currentSettings,
    ticket_design: validatedDesign,
  };

  const { error: updateErr } = await ((adminDb as any)
    .from("events")
    .update({
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId));

  if (updateErr) {
    console.error("Failed to update ticket design:", updateErr);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to persist ticket design.");
  }

  // 3. Log audit event
  await logAuditEvent({
    organizationId: event.organization_id,
    eventId: event.id,
    actorId: user.id,
    actorType: "USER",
    action: "EVENT_UPDATED",
    targetType: "EVENT",
    targetId: event.id,
    metadata: {
      action: "TICKET_DESIGN_UPDATED",
      template: validatedDesign.template,
      backgroundStyle: validatedDesign.backgroundStyle,
      primaryColor: validatedDesign.primaryColor,
    },
  });

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath(`/org/events/${eventId}/ticket-design`);
  revalidatePath("/t/[token]", "page");

  return {
    success: true,
    design: validatedDesign,
  };
}

/**
 * Resets an event's ticket design back to platform defaults.
 */
export async function resetTicketDesign(eventId: string) {
  return saveTicketDesign(eventId, DEFAULT_TICKET_DESIGN);
}

/**
 * Handles secure ticket logo upload.
 * Validates file type, size (max 2MB), and stores securely.
 */
export async function uploadTicketLogo(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const adminDb = getAdminClient();
  const { data: event } = await (adminDb
    .from("events")
    .select("id, organization_id")
    .eq("id", eventId)
    .single() as any);

  if (!event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const isMember = await verifyOrgMembership(adminDb, event.organization_id, user.id);
  if (!isMember) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  const file = formData.get("logo") as File | null;
  if (!file || typeof file === "string") {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "No file uploaded.");
  }

  // 1. File size check (2 MB limit)
  const MAX_SIZE_BYTES = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      `Logo file exceeds the 2 MB limit (uploaded size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`
    );
  }

  // 2. MIME type check
  const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "SVG files are not supported for ticket logos due to security restrictions. Please upload a PNG, JPEG, or WebP image."
    );
  }

  if (!allowedMimeTypes.includes(file.type)) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "Invalid image format. Supported formats are PNG, JPEG, and WebP."
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `ticket-logo-${eventId}-${Date.now()}.${extension}`;

  // 3. Attempt Supabase Storage
  try {
    const bucketName = "ticket-assets";
    // Ensure bucket exists
    const { data: buckets } = await adminDb.storage.listBuckets();
    const hasBucket = buckets?.some((b: any) => b.name === bucketName);

    if (!hasBucket) {
      await adminDb.storage.createBucket(bucketName, { public: true });
    }

    const { data: uploadData, error: uploadErr } = await adminDb.storage
      .from(bucketName)
      .upload(`logos/${fileName}`, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (!uploadErr && uploadData) {
      const { data: publicUrlData } = adminDb.storage
        .from(bucketName)
        .getPublicUrl(`logos/${fileName}`);

      if (publicUrlData?.publicUrl) {
        return {
          success: true,
          logoUrl: publicUrlData.publicUrl,
        };
      }
    }
  } catch (storageErr) {
    console.warn("Supabase Storage bucket upload not available, falling back to public disk storage:", storageErr);
  }

  // 4. Resilient Local File Storage Fallback
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    return {
      success: true,
      logoUrl: `/uploads/logos/${fileName}`,
    };
  } catch (fsErr: any) {
    console.error("Local file save failed:", fsErr);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to store uploaded logo image.");
  }
}
