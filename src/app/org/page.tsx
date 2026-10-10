import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Plus,
  Calendar,
  Users,
  Ticket,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  QrCode,
  FileEdit,
  ShieldCheck,
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

  const liveEvents = events.filter((e: any) => e.status === "LIVE");
  const publishedEvents = events.filter((e: any) => e.status === "PUBLISHED");
  const activeEventsCount = liveEvents.length + publishedEvents.length;

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

  // Determine intelligent verify button route
  const verifyTargetHref =
    liveEvents.length === 1
      ? `/verify?event_id=${liveEvents[0].id}`
      : "/verify";

  return (
    <div className="w-full space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Overview
            </h1>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              {orgInfo.organization.name}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            Monitor active registrations, issued passes, and entrance check-in activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={verifyTargetHref}>
            <Button
              variant="outline"
              size="sm"
              className="font-medium text-xs gap-1.5 shadow-2xs h-9"
            >
              <QrCode className="h-4 w-4 text-zinc-600" />
              <span>Verify Entrance</span>
              {liveEvents.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </Button>
          </Link>
          <Link href="/org/events/new">
            <Button size="sm" className="font-semibold text-xs gap-1.5 shadow-xs h-9">
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Refined Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Events"
          value={activeEventsCount}
          icon={Calendar}
          iconColorClass="text-zinc-900"
          iconBgClass="bg-zinc-100"
          trendText={`${activeEventsCount} of ${events.length} total`}
          trendType="neutral"
          subtext="Events currently accepting registrations or live"
        />

        <MetricCard
          label="Total Registrations"
          value={totalRegistrations}
          icon={Users}
          iconColorClass="text-sky-700"
          iconBgClass="bg-sky-50"
          trendText={pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pending` : "All confirmed"}
          trendType={pendingPaymentsCount > 0 ? "warning" : "positive"}
          subtext="Total participant registrations across your events"
        />

        <MetricCard
          label="Tickets Issued"
          value={ticketsIssuedCount}
          icon={Ticket}
          iconColorClass="text-emerald-700"
          iconBgClass="bg-emerald-50"
          trendText="Delivered"
          trendType="positive"
          subtext="Digital passes delivered to confirmed attendees"
        />

        <MetricCard
          label="Successful Check-ins"
          value={checkedInCount}
          icon={CheckCircle2}
          iconColorClass="text-indigo-700"
          iconBgClass="bg-indigo-50"
          trendText={ticketsIssuedCount > 0 ? `${Math.round((checkedInCount / ticketsIssuedCount) * 100)}% attendance` : "0% attendance"}
          trendType="neutral"
          subtext="Attendees admitted through entrance verification"
        />
      </div>

      {/* Events Table Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900">
              Events
            </h2>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
              {events.length}
            </span>
          </div>

          {events.length > 0 && (
            <Link
              href="/org/events"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              View directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center space-y-4 shadow-2xs">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900">No events created yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Create your first event to configure registration questions, manage passes, and begin entrance check-in.
              </p>
            </div>
            <Link href="/org/events/new">
              <Button size="sm" className="font-semibold text-xs shadow-xs">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create First Event
              </Button>
            </Link>
          </div>
        ) : (
          /* Compact & Professional Event Table */
          <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/75 text-zinc-600 text-xs font-semibold">
                    <th className="py-3 px-4">Event name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Pass type</th>
                    <th className="py-3 px-4">Schedule & venue</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {events.map((event: any) => (
                    <tr
                      key={event.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          <Link
                            href={`/org/events/${event.id}`}
                            className="font-semibold text-zinc-900 group-hover:text-black hover:underline transition-colors text-sm line-clamp-1"
                          >
                            {event.name}
                          </Link>
                          <div className="font-mono text-xs text-zinc-400">
                            /{event.slug}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={event.status} />
                      </td>

                      {/* Pass Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-zinc-700 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                          {event.event_type === "FREE" ? "Free Admission" : "Paid Pass"}
                        </span>
                      </td>

                      {/* Schedule & Location */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="space-y-1 text-zinc-600">
                          {event.date_start ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-xs">Unscheduled</span>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 truncate max-w-[220px]">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* State-Aware Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {event.status === "LIVE" && (
                            <Link
                              href={`/verify?event_id=${event.id}`}
                              title="Active Turnstile Scanner"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 gap-1"
                              >
                                <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                                Scan Gate
                              </Button>
                            </Link>
                          )}

                          {(event.status === "PUBLISHED" || event.status === "LIVE") && (
                            <Link
                              href={`/events/${event.slug}`}
                              target="_blank"
                              title="Public Event Page"
                            >
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-zinc-500 hover:text-zinc-900">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}

                          <Link href={`/org/events/${event.id}/form`} title="Configure Registration Form">
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
