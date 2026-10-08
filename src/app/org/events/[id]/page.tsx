import { getEventById } from "@/app/actions/event.actions";
import { createServerDbClient } from "@/lib/db/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";
import { EventStatusManager } from "@/components/events/event-status-manager";

export const metadata = {
  title: "Event Details - Ticket Platform",
  description: "Manage event details",
};

export const instant = false;

export default async function EventDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization
  const { data: orgUser } = await (supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .single() as any);

  if (!orgUser) {
    redirect("/login");
  }

  const event = await getEventById(id);

  // Security check: event must belong to user's org
  if (event.organization_id !== orgUser.organization_id) {
    redirect("/org");
  }

  const statusColors = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    PUBLISHED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    LIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ENDED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/org" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
              {event.name}
              <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${statusColors[event.status as keyof typeof statusColors]}`}>
                {event.status}
              </span>
            </h1>
            <p className="text-zinc-400 mt-2">Manage your event settings, registrations, and tickets.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/events/${event.slug}`} target="_blank">
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Page
              </Button>
            </Link>
            <Link href={`/org/events/${event.id}/edit`}>
              <Button>Edit Event</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">Event Type</p>
                <p className="text-base text-zinc-100 flex items-center gap-2 mt-1">
                  <Tag className="h-4 w-4 text-zinc-400" />
                  {event.event_type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Slug / URL</p>
                <p className="text-base text-zinc-100 mt-1">/{event.slug}</p>
              </div>
            </div>

            {(event.date_start || event.date_end) && (
              <div>
                <p className="text-sm font-medium text-zinc-500">Date & Time</p>
                <p className="text-base text-zinc-100 flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  {event.date_start && format(new Date(event.date_start), "PPp")}
                  {event.date_end && ` - ${format(new Date(event.date_end), "PPp")}`}
                </p>
              </div>
            )}

            {event.location && (
              <div>
                <p className="text-sm font-medium text-zinc-500">Location</p>
                <p className="text-base text-zinc-100 flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  {event.location}
                </p>
              </div>
            )}

            {event.description && (
              <div>
                <p className="text-sm font-medium text-zinc-500">Description</p>
                <p className="text-sm text-zinc-300 mt-1 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Status Configuration</CardTitle>
              <CardDescription>Update the lifecycle state of your event.</CardDescription>
            </CardHeader>
            <CardContent>
              <EventStatusManager eventId={event.id} currentStatus={event.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
