import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getEvents } from "@/app/actions/event.actions";
import { format } from "date-fns";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Events - Ticket Platform",
  description: "Manage your events",
};

export const instant = false;

export default async function EventsListPage() {
  await connection();
  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) return null;

  const events = await getEvents(orgInfo.organizationId);

  const statusBadges = {
    DRAFT: "bg-zinc-100 text-zinc-600 border-zinc-200",
    PUBLISHED: "bg-sky-50 text-sky-700 border-sky-200",
    LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ENDED: "bg-zinc-100 text-zinc-500 border-zinc-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Events</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage, publish, and monitor your organization&apos;s events.</p>
        </div>
        <Link href="/org/events/new">
          <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
            <PlusCircle className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-16 text-center space-y-4">
          <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900">No events found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Get started by creating your first event to configure passes and open registrations.
            </p>
          </div>
          <Link href="/org/events/new">
            <Button size="sm" className="font-semibold">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event: any) => (
            <div key={event.id} className="border border-zinc-200 rounded-xl bg-white p-5 flex flex-col justify-between shadow-2xs hover:border-zinc-300 transition-colors space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm border font-medium ${statusBadges[event.status as keyof typeof statusBadges] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                    {event.status}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    {event.event_type}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-zinc-900 line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">/{event.slug}</p>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {event.description || "No description provided."}
                </p>

                {event.date_start && (
                  <div className="text-xs text-zinc-500 flex items-center gap-1.5 pt-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <Link href={`/org/events/${event.id}`}>
                  <Button variant="outline" size="sm" className="text-xs font-semibold">
                    Manage Event
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
                {event.status === "PUBLISHED" && (
                  <Link href={`/events/${event.slug}`} target="_blank" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                    View Live Page ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
