import { connection } from "next/server";
import { getAdminClient } from "@/lib/db/admin";
import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { getCachedSession } from "@/lib/db/cached-session";
import { EventWorkspace } from "@/components/events/event-workspace";

export const metadata = {
  title: "Event Details — Ticket Platform",
  description: "Manage event parameters, registration form, passes, and gates",
};

export const instant = false;

export default async function EventDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const params = await props.params;
  const { id } = params;

  // Reuses deduplicated session from OrgLayout — zero extra DB call
  const { user, orgInfo } = await getCachedSession();
  if (!user) redirect("/login");
  if (!orgInfo) redirect("/login");

  const adminDb = getAdminClient();

  // Fetch event + form in parallel — no need to wait for event before fetching form
  const [eventResult, formResult] = await Promise.all([
    adminDb.from("events").select("*").eq("id", id).single() as any,
    adminDb.from("registration_forms").select("*").eq("event_id", id).maybeSingle() as any,
  ]);

  const event = eventResult.data;
  if (!event) redirect("/org/events");

  // Security check: event must belong to user's org
  if (event.organization_id !== orgInfo.organizationId) {
    redirect("/org");
  }

  const form = formResult.data;

  // Fetch all metric counts + data lists in one parallel batch
  const [
    { count: totalRegsCount },
    { count: totalTicketsCount },
    { count: checkedInCount },
    { count: pendingPaymentsRaw },
    { data: registrations },
    { data: tickets },
    { data: verifiers },
  ] = await Promise.all([
    adminDb
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id),
    adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id),
    adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("status", "CHECKED_IN"),
    // Always include this query — it returns 0 for free events (avoids conditional waterfall)
    adminDb
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id)
      .in("payment_status", ["PENDING", "SUBMITTED"]),
    adminDb
      .from("registrations")
      .select("id, participant_name, email, status, created_at, form_data, payment_status, transaction_id")
      .eq("event_id", id)
      .order("created_at", { ascending: false })
      .limit(100) as any,
    adminDb
      .from("tickets")
      .select("id, ticket_number, status, participant_name, participant_email, issued_at, checked_in_at, revoked_at")
      .eq("event_id", id)
      .order("issued_at", { ascending: false })
      .limit(100) as any,
    adminDb
      .from("event_verifiers")
      .select("id, name, email, status, expires_at, last_accessed_at, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false }) as any,
  ]);

  const pendingPaymentsCount = event.event_type === "PAID" ? (pendingPaymentsRaw || 0) : 0;

  return (
    <EventWorkspace
      event={event}
      form={form}
      metrics={{
        registrationsCount: totalRegsCount || 0,
        ticketsCount: totalTicketsCount || 0,
        checkedInCount: checkedInCount || 0,
        pendingPaymentsCount,
      }}
      initialRegistrations={registrations || []}
      initialTickets={tickets || []}
      initialVerifiers={verifiers || []}
    />
  );
}
