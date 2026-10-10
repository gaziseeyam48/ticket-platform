import { connection } from "next/server";
import { getEventById } from "@/app/actions/event.actions";
import { getRegistrationForm } from "@/app/actions/form.actions";
import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { redirect } from "next/navigation";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
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

  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) {
    redirect("/login");
  }

  const event = await getEventById(id);

  // Security check: event must belong to user's org
  if (event.organization_id !== orgInfo.organizationId) {
    redirect("/org");
  }

  const form = await getRegistrationForm(event.id);
  const adminDb = getAdminClient();

  // 1. Fetch exact metric counts from database (fixing previous 20-cap defect)
  const [
    { count: totalRegsCount },
    { count: totalTicketsCount },
    { count: checkedInCount },
  ] = await Promise.all([
    adminDb
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id),
    adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id),
    adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("status", "CHECKED_IN"),
  ]);

  // Fetch pending payments count if paid event
  let pendingPaymentsCount = 0;
  if (event.event_type === "PAID") {
    const { count } = await adminDb
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("payment_status", ["PENDING", "SUBMITTED"]);
    pendingPaymentsCount = count || 0;
  }

  // 2. Query registrations for this event
  const { data: registrations } = await (adminDb
    .from("registrations")
    .select("id, participant_name, email, status, created_at, form_data, payment_status, transaction_id")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(100) as any);

  // 3. Query tickets for this event
  const { data: tickets } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, status, participant_name, participant_email, issued_at, checked_in_at, revoked_at")
    .eq("event_id", event.id)
    .order("issued_at", { ascending: false })
    .limit(100) as any);

  // 4. Query verifiers for this event
  const { data: verifiers } = await (adminDb
    .from("event_verifiers")
    .select("id, name, email, status, expires_at, last_accessed_at, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false }) as any);

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
