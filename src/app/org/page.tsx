import { connection } from "next/server";
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
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getCachedSession } from "@/lib/db/cached-session";

export const metadata = {
  title: "Dashboard — TicketKoi",
  description: "Organization overview, events, and entrance verification metrics",
};

export const instant = false;

export default async function DashboardPage() {
  await connection();

  // Reuses the deduplicated session from OrgLayout — zero extra DB call
  const { user, orgInfo } = await getCachedSession();

  if (!user || !orgInfo) return null;

  const adminDb = getAdminClient();

  // Fetch events and kick off all count queries in parallel
  const [eventsResult, regCountResult, pendingCountResult, ticketCountResult, checkInCountResult] =
    await Promise.all([
      adminDb
        .from("events")
        .select("id, name, slug, status, event_type, date_start, location")
        .eq("organization_id", orgInfo.organizationId)
        .order("created_at", { ascending: false }) as any,
      adminDb
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgInfo.organizationId),
      adminDb
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgInfo.organizationId)
        .eq("status", "PENDING_PAYMENT"),
      adminDb
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgInfo.organizationId),
      adminDb
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgInfo.organizationId)
        .eq("status", "CHECKED_IN"),
    ]);

  const events: any[] = eventsResult.data || [];
  const totalRegistrations = regCountResult.count || 0;
  const pendingPaymentsCount = pendingCountResult.count || 0;
  const ticketsIssuedCount = ticketCountResult.count || 0;
  const checkedInCount = checkInCountResult.count || 0;

  const liveEvents = events.filter((e: any) => e.status === "LIVE");
  const publishedEvents = events.filter((e: any) => e.status === "PUBLISHED");
  const activeEventsCount = liveEvents.length + publishedEvents.length;

  // Determine intelligent verify button route
  const verifyTargetHref =
    liveEvents.length === 1
      ? `/verify?event_id=${liveEvents[0].id}`
      : "/verify";

  return (
    <div className="w-full space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE1E8]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171923] leading-tight">
              Overview
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F4F8] text-[#171923] border border-[#DCE1E8]">
              {orgInfo.organization.name}
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#525B6B] leading-normal">
            Monitor active registrations, issued passes, and entrance check-in activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={verifyTargetHref}>
            <Button
              variant="outline"
              size="sm"
              className="font-medium text-sm gap-2 shadow-2xs h-9 sm:h-10 px-3.5"
            >
              <QrCode className="h-4 w-4 text-[#525B6B]" />
              <span>Verify Entrance</span>
              {liveEvents.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-[#087F5B] animate-pulse ml-0.5" />
              )}
            </Button>
          </Link>
          <Link href="/org/events/new">
            <Button size="sm" className="font-semibold text-sm gap-2 shadow-xs h-9 sm:h-10 px-3.5">
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Refined Operational Metric Cards with Coordinated Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Events"
          value={activeEventsCount}
          icon={Calendar}
          accent="blue"
          trendText={`${activeEventsCount} of ${events.length} total`}
          trendType="neutral"
          subtext="Accepting registrations or live gates"
          href="/org/events"
        />

        <MetricCard
          label="Total Registrations"
          value={totalRegistrations}
          icon={Users}
          accent="blue"
          trendText={pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pending` : "All confirmed"}
          trendType={pendingPaymentsCount > 0 ? "warning" : "positive"}
          subtext="Participant registrations across all events"
        />

        <MetricCard
          label="Tickets Issued"
          value={ticketsIssuedCount}
          icon={Ticket}
          accent="violet"
          trendText="Delivered"
          trendType="positive"
          subtext="Digital passes dispatched to inboxes"
        />

        <MetricCard
          label="Successful Check-ins"
          value={checkedInCount}
          icon={CheckCircle2}
          accent="green"
          trendText={
            ticketsIssuedCount > 0
              ? `${Math.round((checkedInCount / ticketsIssuedCount) * 100)}% attendance`
              : "0% attendance"
          }
          trendType={checkedInCount > 0 ? "positive" : "neutral"}
          subtext="Attendees admitted through turnstiles"
        />
      </div>

      {/* Events Table Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[#171923]">
              Events
            </h2>
            <span className="text-xs font-mono font-medium text-[#525B6B] bg-[#F1F4F8] px-2.5 py-0.5 rounded-full border border-[#DCE1E8]">
              {events.length}
            </span>
          </div>

          {events.length > 0 && (
            <Link
              href="/org/events"
              className="text-sm font-semibold text-[#525B6B] hover:text-[#171923] transition-colors flex items-center gap-1"
            >
              View directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-[#DCE1E8] bg-white p-12 text-center space-y-4 shadow-2xs">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F1F4F8] flex items-center justify-center text-[#525B6B]">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[#171923]">No events created yet</h3>
              <p className="text-sm text-[#525B6B] max-w-sm mx-auto leading-relaxed">
                Create your first event to configure registration questions, manage passes, and begin entrance check-in.
              </p>
            </div>
            <Link href="/org/events/new">
              <Button size="sm" className="font-semibold text-sm shadow-xs h-9 px-4">
                <Plus className="mr-1.5 h-4 w-4" />
                Create First Event
              </Button>
            </Link>
          </div>
        ) : (
          /* Compact & Professional Event Table */
          <div className="bg-white border border-[#DCE1E8] rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] text-xs font-mono uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Event name</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Pass type</th>
                    <th className="py-3 px-4 font-semibold">Schedule &amp; venue</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2] text-[#525B6B]">
                  {events.map((event: any) => (
                    <tr
                      key={event.id}
                      className="hover:bg-[#F7F8FA] transition-colors group"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="space-y-0.5">
                          <Link
                            href={`/org/events/${event.id}`}
                            className="font-semibold text-[#171923] group-hover:text-black hover:underline transition-colors text-sm line-clamp-1"
                          >
                            {event.name}
                          </Link>
                          <div className="font-mono text-xs text-[#667085]">
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
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
                            event.event_type === "PAID"
                              ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                              : "bg-[#F1F4F8] text-[#525B6B] border-[#DCE1E8]"
                          }`}
                        >
                          {event.event_type === "FREE" ? "Free" : "Paid"}
                        </span>
                      </td>

                      {/* Schedule & Location */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="space-y-1 text-[#525B6B]">
                          {event.date_start ? (
                            <div className="flex items-center gap-1.5 text-sm text-[#171923]">
                              <Clock className="h-3.5 w-3.5 text-[#667085] shrink-0" />
                              <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                            </div>
                          ) : (
                            <span className="text-[#667085] italic text-sm">Unscheduled</span>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-1.5 text-[13px] text-[#667085] truncate max-w-[220px]">
                              <MapPin className="h-3.5 w-3.5 text-[#667085] shrink-0" />
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
                                className="h-8 px-2.5 text-xs font-semibold text-[#06694A] bg-[#E6F7F0] hover:bg-[#D1F2E5] border-[#A3E6CD] gap-1"
                              >
                                <QrCode className="h-3.5 w-3.5 text-[#087F5B]" />
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
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-[#525B6B] hover:text-[#171923]">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}

                          <Link href={`/org/events/${event.id}/form`} title="Configure Registration Form">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-[#525B6B] hover:text-[#171923]">
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
