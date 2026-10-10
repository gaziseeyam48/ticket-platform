import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import { getOrganizationAuditLogs } from "@/lib/services/audit.service";
import { AuditLogViewer } from "@/components/audit/audit-log-viewer";

export const instant = false;

export default async function OrgAuditLogsPage() {
  await connection();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo?.organizationId) {
    redirect("/login");
  }

  const adminDb = getAdminClient();

  // 1. Fetch organization events for event filter dropdown
  const { data: eventsData } = await (adminDb
    .from("events")
    .select("id, name")
    .eq("organization_id", orgInfo.organizationId)
    .order("created_at", { ascending: false }) as any);

  const events = eventsData || [];

  // 2. Fetch recent audit logs for the organization
  const { logs } = await getOrganizationAuditLogs({
    organizationId: orgInfo.organizationId,
    limit: 100,
  });

  return (
    <AuditLogViewer
      initialLogs={logs}
      events={events}
      organizationName={orgInfo.organization?.name || "Organization"}
    />
  );
}
