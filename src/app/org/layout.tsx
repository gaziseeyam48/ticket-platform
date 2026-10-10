import { ReactNode } from "react";
import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import { OrgShell } from "@/components/layout/org-shell";
import { getAdminClient } from "@/lib/db/admin";

export const instant = false;

export default async function OrgLayout({ children }: { children: ReactNode }) {
  await connection();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch or auto-provision organization for this user
  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  const organization = orgInfo?.organization || null;

  // Count active events for badge
  let activeEventsCount = 0;
  if (orgInfo?.organizationId) {
    const adminDb = getAdminClient();
    const { count } = await adminDb
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgInfo.organizationId)
      .in("status", ["PUBLISHED", "LIVE"]);
    activeEventsCount = count || 0;
  }

  return (
    <OrgShell
      organizationName={organization?.name || "Organization"}
      userEmail={user.email || "Organizer"}
      activeEventsCount={activeEventsCount}
    >
      {children}
    </OrgShell>
  );
}
