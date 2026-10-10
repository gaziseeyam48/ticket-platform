import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import {
  PlusCircle,
  Calendar,
  Users,
  Ticket,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  FileEdit,
} from "lucide-react";
import Link from "next/link";
import { getEvents } from "@/app/actions/event.actions";
import { format } from "date-fns";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Dashboard — Ticket Platform",
  description: "Organization overview, events, and entrance verification metrics",
};

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) return null;

  const events = await getEvents(orgInfo.organizationId);
  const eventIds = events.map((e: any) => e.id);

  const activeEventsCount = events.filter(
    (e: any) => e.status === "PUBLISHED" || e.status === "LIVE"
  ).length;

  let totalRegistrations = 0;
  let pendingPaymentsCount = 0;
  let ticketsIssuedCount = 0;
  let checkedInCount = 0;

  if (eventIds.length > 0) {
    const adminDb = getAdminClient();

    // Query registrations count
    const { count: regCount } = await adminDb
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .in("event_id", eventIds);
    totalRegistrations = regCount || 0;

    // Query pending payments count
    const { count: pendingCount } = await adminDb
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .in("event_id", eventIds)
      .eq("status", "PENDING_PAYMENT");
    pendingPaymentsCount = pendingCount || 0;

    // Query tickets issued count
    const { count: ticketCount } = await adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("event_id", eventIds);
    ticketsIssuedCount = ticketCount || 0;

    // Query checked in count
    const { count: checkInCount } = await adminDb
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("event_id", eventIds)
      .eq("status", "CHECKED_IN");
    checkedInCount = checkInCount || 0;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Overview
            </h1>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {orgInfo.organization.name}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time status of your event registration pipelines and gate turnstiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/verify">
            <Button variant="outline" size="sm" className="font-medium text-xs gap-1.5 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Verify Entrance
            </Button>
          </Link>
          <Link href="/org/events/new">
            <Button size="sm" className="font-semibold text-xs gap-1.5 shadow-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Operational Metric Cards (Sparlink / FlowMail style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Events"
          value={activeEventsCount}
          icon={Calendar}
          iconColorClass="text-zinc-900"
          iconBgClass="bg-zinc-100"
          trendText={`${events.length} total`}
          trendType="neutral"
          subtext="Events accepting registrations or check-in"
        />

        <MetricCard
          label="Total Registrations"
          value={totalRegistrations}
          icon={Users}
          iconColorClass="text-sky-700"
          iconBgClass="bg-sky-50"
          trendText={pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pending` : "All cleared"}
          trendType={pendingPaymentsCount > 0 ? "warning" : "positive"}
          subtext="Confirmed and reserved attendee submissions"
        />

        <MetricCard
          label="Passes Issued"
          value={ticketsIssuedCount}
          icon={Ticket}
          iconColorClass="text-emerald-700"
          iconBgClass="bg-emerald-50"
          trendText="Active"
          trendType="positive"
          subtext="Cryptographically signed QR entrance passes"
        />

        <MetricCard
          label="Check-ins Verified"
          value={checkedInCount}
          icon={CheckCircle2}
          iconColorClass="text-indigo-700"
          iconBgClass="bg-indigo-50"
          trendText={ticketsIssuedCount > 0 ? `${Math.round((checkedInCount / ticketsIssuedCount) * 100)}% turnstile` : "0% turnstile"}
          trendType="neutral"
          subtext="Atomic entrance turnstile validations"
        />
      </div>

      {/* Events Table Container (Shiptrack / AutomatePro high density style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">
              Active Events & Portals
            </h2>
            <span className="text-xs font-mono text-zinc-400">
              ({events.length})
            </span>
          </div>

          {events.length > 0 && (
            <Link
              href="/org/events"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              Manage all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          /* Zero-state empty container */
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center space-y-4 shadow-2xs">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">No events created yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Launch your first event to configure registration questions, manage tickets, and begin entrance check-in.
              </p>
            </div>
            <Link href="/org/events/new">
              <Button size="sm" className="font-semibold text-xs shadow-xs">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Create First Event
              </Button>
            </Link>
          </div>
        ) : (
          /* High-density Data Table */
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Event Name & Path</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Type</th>
                    <th className="py-3.5 px-4 font-semibold">Schedule & Location</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {events.map((event: any) => (
                    <tr
                      key={event.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <Link
                            href={`/org/events/${event.id}`}
                            className="font-bold text-zinc-900 group-hover:text-black hover:underline transition-colors text-sm line-clamp-1"
                          >
                            {event.name}
                          </Link>
                          <div className="font-mono text-[11px] text-zinc-400">
                            /{event.slug}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={event.status} />
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-zinc-600 px-2 py-0.5 rounded-sm bg-zinc-100 border border-zinc-200/80">
                          {event.event_type}
                        </span>
                      </td>

                      {/* Schedule & Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-zinc-600">
                          {event.date_start ? (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Clock className="h-3 w-3 text-zinc-400 shrink-0" />
                              <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-[11px]">No date scheduled</span>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 truncate max-w-[200px]">
                              <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {event.status === "PUBLISHED" || event.status === "LIVE" ? (
                            <Link
                              href={`/events/${event.slug}`}
                              target="_blank"
                              title="Public Event Page"
                            >
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-500 hover:text-zinc-900">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          ) : null}

                          <Link href={`/org/events/${event.id}/form`} title="Configure Form">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-500 hover:text-zinc-900">
                              <FileEdit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Link href={`/org/events/${event.id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 font-semibold text-xs gap-1 shadow-2xs">
                              Manage
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
