import { connection } from "next/server";
import { getEventById } from "@/app/actions/event.actions";
import { getRegistrationForm } from "@/app/actions/form.actions";
import { createServerDbClient } from "@/lib/db/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, MapPin, Tag, FileText } from "lucide-react";
import { format } from "date-fns";
import { EventStatusManager } from "@/components/events/event-status-manager";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Event Details - Ticket Platform",
  description: "Manage event details",
};

export const instant = false;

export default async function EventDetailsPage(props: { params: Promise<{ id: string }> }) {
  await connection();
  const params = await props.params;
  const { id } = params;

  const supabase = await createServerDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization
  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);

  if (!orgInfo) {
    redirect("/login");
  }

  const event = await getEventById(id);

  // Security check: event must belong to user's org
  if (event.organization_id !== orgInfo.organizationId) {
    redirect("/org");
  }

  const form = await getRegistrationForm(event.id);

  const statusBadges = {
    DRAFT: "bg-zinc-100 text-zinc-600 border-zinc-200",
    PUBLISHED: "bg-sky-50 text-sky-700 border-sky-200",
    LIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ENDED: "bg-zinc-100 text-zinc-500 border-zinc-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/org" className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-3">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {event.name}
              </h1>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm border font-medium ${statusBadges[event.status as keyof typeof statusBadges] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                {event.status}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">/{event.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/events/${event.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs font-medium">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                Public Page
              </Button>
            </Link>
            <Link href={`/org/events/${event.id}/form`}>
              <Button variant="outline" size="sm" className="text-xs font-medium">
                <FileText className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                Form Builder
              </Button>
            </Link>
            <Link href={`/org/events/${event.id}/edit`}>
              <Button size="sm" className="text-xs font-semibold">
                Edit Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-zinc-200 bg-white shadow-xs md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Event Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-mono text-zinc-400 uppercase">Event Type</p>
                <p className="text-sm font-medium text-zinc-900 flex items-center gap-2 mt-1">
                  <Tag className="h-3.5 w-3.5 text-zinc-400" />
                  {event.event_type}
                </p>
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-400 uppercase">Slug / Path</p>
                <p className="text-sm font-mono text-zinc-700 mt-1">/{event.slug}</p>
              </div>
            </div>

            {(event.date_start || event.date_end) && (
              <div>
                <p className="text-xs font-mono text-zinc-400 uppercase">Schedule</p>
                <p className="text-sm text-zinc-800 flex items-center gap-2 mt-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  {event.date_start && format(new Date(event.date_start), "PPp")}
                  {event.date_end && ` - ${format(new Date(event.date_end), "PPp")}`}
                </p>
              </div>
            )}

            {event.location && (
              <div>
                <p className="text-xs font-mono text-zinc-400 uppercase">Location</p>
                <p className="text-sm text-zinc-800 flex items-center gap-2 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {event.location}
                </p>
              </div>
            )}

            {event.description && (
              <div>
                <p className="text-xs font-mono text-zinc-400 uppercase">Description</p>
                <p className="text-sm text-zinc-600 mt-1 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-500" />
                  Registration Form
                </CardTitle>
                <CardDescription className="text-xs">
                  {form?.fields?.length || 0} fields configured
                </CardDescription>
              </div>
              <Link href={`/org/events/${event.id}/form`}>
                <Button size="sm" variant="outline" className="text-xs font-semibold">
                  Configure
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {(form?.fields || []).slice(0, 6).map((f: any) => (
                  <span
                    key={f.id}
                    className="text-[11px] px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 border border-zinc-200"
                  >
                    {f.label} {f.required && "*"}
                  </span>
                ))}
                {(form?.fields?.length || 0) > 6 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-500">
                    +{(form?.fields?.length || 0) - 6} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Lifecycle Gate</CardTitle>
              <CardDescription className="text-xs">Transition state to accept attendees or begin check-ins.</CardDescription>
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
