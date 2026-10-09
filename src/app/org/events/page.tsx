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

  const statusColors = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PUBLISHED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    LIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ENDED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Events</h1>
          <p className="text-zinc-400 mt-1">Manage and create events for your organization.</p>
        </div>
        <Link href="/org/events/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="bg-zinc-900/20 border-zinc-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-200">No events found</h3>
            <p className="text-zinc-500 max-w-sm mt-2 mb-6">
              You haven&apos;t created any events yet. Create your first event to get started.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any) => (
            <Card key={event.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColors[event.status as keyof typeof statusColors] || "text-zinc-400 border-zinc-700"}`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    {event.event_type}
                  </span>
                </div>
                <CardTitle className="text-lg font-semibold text-zinc-100 mt-3 line-clamp-1">
                  {event.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {event.description || "No description provided."}
                </p>
                {event.date_start && (
                  <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(event.date_start), "MMM d, yyyy h:mm a")}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <Link href={`/org/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="text-zinc-300">
                      Manage Event
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
