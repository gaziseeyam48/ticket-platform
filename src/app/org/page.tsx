import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Users, Activity, Settings, ExternalLink } from "lucide-react";
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
  const totalRegistrations = 0; // Will be implemented in Phase 4/5

  const statusColors = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PUBLISHED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    LIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ENDED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Welcome back. Here&apos;s an overview of your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeEventsCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalRegistrations}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mt-12">
        <h2 className="text-xl font-bold text-zinc-100">Your Events</h2>
        <Link href="/org/events/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="bg-zinc-900/20 border-zinc-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-200">No events found</h3>
            <p className="text-zinc-500 max-w-sm mt-2 mb-6">
              You don&apos;t have any events yet. Create your first event to start accepting registrations.
            </p>
            <Link href="/org/events/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event: any) => (
            <Card key={event.id} className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/80 transition-colors">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/org/events/${event.id}`} className="font-semibold text-lg text-zinc-100 hover:text-indigo-400 transition-colors">
                      {event.name}
                    </Link>
                    <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${statusColors[event.status as keyof typeof statusColors]}`}>
                      {event.status}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border bg-zinc-800/50 text-zinc-300 border-zinc-700">
                      {event.event_type}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {event.date_start && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.date_start), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-zinc-500">
                      /{event.slug}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/events/${event.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-8">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Page
                    </Button>
                  </Link>
                  <Link href={`/org/events/${event.id}`}>
                    <Button variant="secondary" size="sm" className="h-8">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

