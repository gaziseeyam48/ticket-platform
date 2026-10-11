import { ReactNode, Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { OrgShell } from "@/components/layout/org-shell";
import { getAdminClient } from "@/lib/db/admin";
import { getCachedSession } from "@/lib/db/cached-session";

export const instant = false;

async function ActiveEventsCount({ organizationId }: { organizationId: string }) {
  const adminDb = getAdminClient();
  const { count } = await adminDb
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("status", ["PUBLISHED", "LIVE"]);
  return count || 0;
}

export default async function OrgLayout({ children }: { children: ReactNode }) {
  await connection();

  const { user, orgInfo } = await getCachedSession();

  if (!user) {
    redirect("/login");
  }

  if (!orgInfo) {
    redirect("/login");
  }

  const organization = orgInfo.organization;

  // Fetch active events count in parallel (non-blocking for layout render)
  const activeEventsCount = await ActiveEventsCount({ organizationId: orgInfo.organizationId });

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
