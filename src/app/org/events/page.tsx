import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
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
import { getEvents } from "@/app/actions/event.actions";
import { format } from "date-fns";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Events — Ticket Platform",
  description: "Manage, publish, and monitor your organization's events",
};

export const instant = false;

export default async function EventsListPage() {
  await connection();
  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) return null;

  const events = await getEvents(orgInfo.organizationId);

  return (
    <div className="w-full space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Events Directory
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure registration forms, monitor capacities, and control entrance turnstiles.
          </p>
        </div>

        <Link href="/org/events/new">
          <Button size="sm" className="font-semibold text-xs gap-1.5 shadow-xs h-9">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center space-y-4 shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900">No events found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Get started by creating your first event to configure passes and open registrations.
            </p>
          </div>
          <Link href="/org/events/new">
            <Button size="sm" className="font-semibold text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event: any) => (
            <div
              key={event.id}
              className="border border-zinc-200/80 rounded-2xl bg-white p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-zinc-300 transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Status & Type */}
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={event.status} />
                  <span className="text-xs font-medium text-zinc-700 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                    {event.event_type === "FREE" ? "Free Admission" : "Paid Pass"}
                  </span>
                </div>

                {/* Event Name & Slug */}
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 group-hover:text-black line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">
                    /{event.slug}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {event.description || "No description provided."}
                </p>

                {/* Schedule & Venue Meta */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
                  {event.date_start ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-400 italic text-xs">Unscheduled</span>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 truncate">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {event.status === "LIVE" && (
                    <Link href={`/verify?event_id=${event.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                        <QrCode className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                        Gate
                      </Button>
                    </Link>
                  )}

                  <Link href={`/org/events/${event.id}/form`}>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-900">
                      <FileEdit className="h-3.5 w-3.5 mr-1" />
                      Form
                    </Button>
                  </Link>

                  {(event.status === "PUBLISHED" || event.status === "LIVE") && (
                    <Link href={`/events/${event.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-900">
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
