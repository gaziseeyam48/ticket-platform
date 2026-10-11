import { cache } from "react";
import { createServerDbClient } from "@/lib/db/server";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import type { UserOrganizationInfo } from "@/lib/db/org-helper";

/**
 * React `cache()` deduplicates calls within a single request.
 * Layouts and pages both calling getUser/getOrgInfo will share
 * the same resolved promise — only ONE DB round-trip per request.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCachedOrgInfo = cache(
  async (userId: string, email?: string): Promise<UserOrganizationInfo | null> => {
    return getOrCreateUserOrganization(userId, email);
  }
);

/**
 * Convenience: get both user and org in one call, deduplicated per request.
 */
export const getCachedSession = cache(async () => {
  const user = await getCachedUser();
  if (!user) return { user: null, orgInfo: null };
  const orgInfo = await getCachedOrgInfo(user.id, user.email ?? undefined);
  return { user, orgInfo };
});
