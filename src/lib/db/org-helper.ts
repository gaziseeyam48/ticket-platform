import { getAdminClient } from "@/lib/db/admin";

export interface UserOrganizationInfo {
  organizationId: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Retrieves the organization for an authenticated user.
 * If the user has an auth account but no organization record exists yet
 * (e.g. from direct signup or migration timing), this function automatically
 * provisions a default organization and assigns them as OWNER.
 */
export async function getOrCreateUserOrganization(
  userId: string,
  userEmail?: string
): Promise<UserOrganizationInfo | null> {
  const adminDb = getAdminClient();

  // 1. Try to find existing organization membership
  const { data: orgUser } = await (adminDb
    .from("organization_users")
    .select("organization_id, role, organizations(id, name, slug)")
    .eq("user_id", userId)
    .maybeSingle() as any);

  if (orgUser && orgUser.organization_id && orgUser.organizations) {
    return {
      organizationId: orgUser.organization_id,
      role: orgUser.role,
      organization: orgUser.organizations,
    };
  }

  // 2. Self-healing: automatically provision organization for the user
  const emailPrefix = userEmail ? userEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") : "My";
  const orgName = `${emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : "My"} Organization`;
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const slug = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomSuffix}`;

  const { data: newOrg, error: orgError } = await ((adminDb as any)
    .from("organizations")
    .insert({
      name: orgName,
      slug,
    })
    .select()
    .single() as any);

  if (orgError || !newOrg) {
    console.error("Auto-provision organization failed:", orgError);
    return null;
  }

  const { error: linkError } = await ((adminDb as any)
    .from("organization_users")
    .insert({
      organization_id: newOrg.id,
      user_id: userId,
      role: "OWNER",
    }) as any);

  if (linkError) {
    console.error("Auto-link organization user failed:", linkError);
    return null;
  }

  return {
    organizationId: newOrg.id,
    role: "OWNER",
    organization: newOrg,
  };
}
