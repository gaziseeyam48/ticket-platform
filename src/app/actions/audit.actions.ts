"use server";

import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { getOrganizationAuditLogs, GetAuditLogsParams } from "@/lib/services/audit.service";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

/**
 * Server action to fetch audit logs for the authenticated user's organization.
 */
export async function getAuditLogsAction(params: Omit<GetAuditLogsParams, "organizationId">) {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized");
  }

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo?.organizationId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "No organization found for user.");
  }

  // Verify membership
  const adminDb = getAdminClient();
  const { data: membership } = await (adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", orgInfo.organizationId)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden");
  }

  return await getOrganizationAuditLogs({
    ...params,
    organizationId: orgInfo.organizationId,
  });
}
