import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Plus,
  Calendar,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  FileEdit,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getCachedSession } from "@/lib/db/cached-session";
import { getAdminClient } from "@/lib/db/admin";

export const metadata = {
  title: "Events — TicketKoi",
  description: "Manage, publish, and monitor your organization's events",
};

export const instant = false;

export default async function EventsListPage() {
  await connection();

  // Reuses deduplicated session from OrgLayout — zero extra DB call
  const { user, orgInfo } = await getCachedSession();
  if (!user || !orgInfo) return null;

  const adminDb = getAdminClient();
  const { data: events } = await (adminDb
    .from("events")
    .select("id, name, slug, status, event_type, date_start, location, description")
    .eq("organization_id", orgInfo.organizationId)
    .order("created_at", { ascending: false }) as any);

  return (
    <div className="w-full space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE1E8]">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171923] leading-tight">
            Events Directory
          </h1>
          <p className="text-sm sm:text-base text-[#525B6B]">
            Configure registration forms, monitor capacities, and control entrance turnstiles.
          </p>
        </div>

        <Link href="/org/events/new">
          <Button size="sm" className="font-semibold text-sm gap-2 shadow-xs h-9 sm:h-10 px-3.5">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE1E8] bg-white p-16 text-center space-y-4 shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F1F4F8] flex items-center justify-center text-[#525B6B]">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#171923]">No events found</h3>
            <p className="text-sm text-[#525B6B] max-w-sm mx-auto leading-relaxed">
              Get started by creating your first event to configure passes and open registrations.
            </p>
          </div>
          <Link href="/org/events/new">
            <Button size="sm" className="font-semibold text-sm h-9 px-4">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event: any) => (
            <div
              key={event.id}
              className="border border-[#DCE1E8] rounded-2xl bg-white p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-[#9AA4B2] transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Status & Type */}
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={event.status} />
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
                      event.event_type === "PAID"
                        ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                        : "bg-[#F1F4F8] text-[#525B6B] border-[#DCE1E8]"
                    }`}
                  >
                    {event.event_type === "FREE" ? "Free" : "Paid"}
                  </span>
                </div>

                {/* Event Name & Slug */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#171923] group-hover:text-black line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-xs font-mono text-[#667085] mt-0.5">
                    /{event.slug}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-[#525B6B] line-clamp-2 leading-relaxed">
                  {event.description || "No description provided."}
                </p>

                {/* Schedule & Venue Meta */}
                <div className="space-y-1.5 pt-2 border-t border-[#E9EDF2] text-sm text-[#525B6B]">
                  {event.date_start ? (
                    <div className="flex items-center gap-1.5 text-sm text-[#171923]">
                      <Clock className="h-3.5 w-3.5 text-[#667085] shrink-0" />
                      <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                    </div>
                  ) : (
                    <span className="text-[#667085] italic text-sm">Unscheduled</span>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-1.5 text-[13px] text-[#667085] truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#667085] shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#E9EDF2] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {event.status === "LIVE" && (
                    <Link href={`/verify?event_id=${event.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-semibold text-[#06694A] bg-[#E6F7F0] hover:bg-[#D1F2E5] border-[#A3E6CD]"
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1 text-[#087F5B]" />
                        Gate
                      </Button>
                    </Link>
                  )}

                  <Link href={`/org/events/${event.id}/form`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-[#525B6B] hover:text-[#171923]">
                      <FileEdit className="h-3.5 w-3.5 mr-1" />
                      Form
                    </Button>
                  </Link>

                  {(event.status === "PUBLISHED" || event.status === "LIVE") && (
                    <Link href={`/events/${event.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium text-[#525B6B] hover:text-[#171923]">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Page
                      </Button>
                    </Link>
                  )}
                </div>

                <Link href={`/org/events/${event.id}`}>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold shadow-2xs gap-1">
                    Manage
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
