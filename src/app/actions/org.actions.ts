"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/db/admin";
import { getCachedSession } from "@/lib/db/cached-session";

const updateOrgSchema = z.object({
  organizationName: z.string().min(2, "Name must be at least 2 characters").max(80, "Name cannot exceed 80 characters"),
});

export async function updateOrganizationAction(prevState: any, formData: FormData) {
  try {
    const { user, orgInfo } = await getCachedSession();
    if (!user || !orgInfo) {
      return { error: "You must be signed in to update organization settings." };
    }

    if (orgInfo.role !== "OWNER" && orgInfo.role !== "ADMIN") {
      return { error: "Only owners or administrators can modify workspace details." };
    }

    const organizationName = formData.get("organizationName") as string;
    const parsed = updateOrgSchema.safeParse({ organizationName });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const adminDb = getAdminClient();
    const { error: updateError } = await (adminDb
      .from("organizations") as any)
      .update({
        name: parsed.data.organizationName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orgInfo.organizationId);

    if (updateError) {
      console.error("Failed to update organization:", updateError);
      return { error: "Failed to save organization name. Please try again." };
    }

    revalidatePath("/org", "layout");
    revalidatePath("/org/settings");
    return { success: true, message: "Organization name updated successfully!" };
  } catch (err: any) {
    console.error("Unexpected error updating organization:", err);
    return { error: "An unexpected error occurred while saving." };
  }
}
