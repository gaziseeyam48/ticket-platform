import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Users, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getEvents } from "@/app/actions/event.actions";
import { format } from "date-fns";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Dashboard - Ticket Platform",
  description: "Organization dashboard",
};

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);
  if (!orgInfo) return null;

  const events = await getEvents(orgInfo.organizationId);

  const activeEventsCount = events.filter((e: any) => e.status === "PUBLISHED" || e.status === "LIVE").length;
  const totalRegistrations = 0; // Phase 4/5 integration

  const statusBadges = {
    DRAFT: "bg-zinc-100 text-zinc-600 border-zinc-200",
    PUBLISHED: "bg-sky-50 text-sky-700 border-sky-200",
    LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ENDED: "bg-zinc-100 text-zinc-500 border-zinc-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview of your events and registrations.</p>
        </div>
        <Link href="/org/events/new">
          <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
            <PlusCircle className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{activeEventsCount}</div>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-zinc-500">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table / Card Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">Recent Events</h2>
          {events.length > 0 && (
            <Link href="/org/events" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              View all ({events.length})
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900">No events yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Create your first event to configure tickets, registration questions, and gates.
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
          <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-2xs divide-y divide-zinc-200">
            {events.map((event: any) => (
              <div key={event.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm border font-medium ${statusBadges[event.status as keyof typeof statusBadges] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                      {event.status}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      {event.event_type}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    {event.name}
                  </h3>
                  <div className="text-xs text-zinc-500 flex items-center gap-3">
                    <span className="font-mono">/{event.slug}</span>
                    {event.date_start && (
                      <>
                        <span>•</span>
                        <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/org/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold">
                      Manage
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
