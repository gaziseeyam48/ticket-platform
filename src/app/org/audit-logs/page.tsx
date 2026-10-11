import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/db/admin";
import { getOrganizationAuditLogs } from "@/lib/services/audit.service";
import { AuditLogViewer } from "@/components/audit/audit-log-viewer";
import { getCachedSession } from "@/lib/db/cached-session";

export const metadata = {
  title: "Audit Logs — TicketKoi",
  description: "View organization security and activity logs",
};

export const instant = false;

export default async function OrgAuditLogsPage() {
  await connection();

  // Reuses deduplicated session from OrgLayout — zero extra DB call
  const { user, orgInfo } = await getCachedSession();
  if (!user) redirect("/login");
  if (!orgInfo?.organizationId) redirect("/login");

  const adminDb = getAdminClient();

  // Fetch events and audit logs in parallel
  const [{ data: eventsData }, { logs }] = await Promise.all([
    adminDb
      .from("events")
      .select("id, name")
      .eq("organization_id", orgInfo.organizationId)
      .order("created_at", { ascending: false }) as any,
    getOrganizationAuditLogs({
      organizationId: orgInfo.organizationId,
      limit: 100,
    }),
  ]);

  const events = eventsData || [];

  return (
    <AuditLogViewer
      initialLogs={logs}
      events={events}
      organizationName={orgInfo.organization?.name || "Organization"}
    />
  );
}
