import { connection } from "next/server";
import { getEventById } from "@/app/actions/event.actions";
import { getRegistrationForm } from "@/app/actions/form.actions";
import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  FileText,
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  FileEdit,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { format } from "date-fns";
import { EventStatusManager } from "@/components/events/event-status-manager";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Event Details — Ticket Platform",
  description: "Manage event parameters, registration form, passes, and gates",
};

export const instant = false;

export default async function EventDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const params = await props.params;
  const { id } = params;

  const supabase = await createServerDbClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  // Query registrations and tickets for this event
  const adminDb = getAdminClient();
  const { data: registrations } = await (adminDb
    .from("registrations")
    .select("id, participant_name, email, status, created_at, answers")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(20) as any);

  const { data: tickets } = await (adminDb
    .from("tickets")
    .select("id, ticket_number, status, participant_name, participant_email, issued_at, checked_in_at")
    .eq("event_id", event.id)
    .order("issued_at", { ascending: false })
    .limit(20) as any);

  const totalRegs = (registrations || []).length;
  const totalTickets = (tickets || []).length;
  const checkedInTickets = (tickets || []).filter((t: any) => t.status === "CHECKED_IN").length;

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/org/events"
          className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-3"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Events
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {event.name}
              </h1>
              <StatusBadge status={event.status} />
              <span className="text-xs font-medium text-zinc-700 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">
                {event.event_type === "FREE" ? "Free Admission" : "Paid Pass"}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">/{event.slug}</p>
          </div>

          <div className="flex items-center gap-2">
            {event.status === "LIVE" ? (
              <Link href={`/verify?event_id=${event.id}`}>
                <Button size="sm" className="text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                  <QrCode className="h-3.5 w-3.5" />
                  Scan Gate
                </Button>
              </Link>
            ) : (
              <Link href={`/verify?event_id=${event.id}`}>
                <Button variant="outline" size="sm" className="text-xs font-medium gap-1.5 shadow-2xs">
                  <QrCode className="h-3.5 w-3.5 text-zinc-400" />
                  Gate Scanner
                </Button>
              </Link>
            )}

            {(event.status === "PUBLISHED" || event.status === "LIVE") && (
              <Link href={`/events/${event.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="text-xs font-medium gap-1.5 shadow-2xs">
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  Public Page
                </Button>
              </Link>
            )}

            <Link href={`/org/events/${event.id}/form`}>
              <Button variant="outline" size="sm" className="text-xs font-medium gap-1.5 shadow-2xs">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                Form Builder
              </Button>
            </Link>

            <Link href={`/org/events/${event.id}/edit`}>
              <Button size="sm" className="text-xs font-semibold gap-1.5 shadow-xs">
                <FileEdit className="h-3.5 w-3.5" />
                Edit Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards for this Event */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Event Registrations"
          value={totalRegs}
          icon={Users}
          iconColorClass="text-sky-700"
          iconBgClass="bg-sky-50"
          trendText={`${totalRegs} attendees`}
          trendType="neutral"
          subtext="Submissions received via public registration form"
        />

        <MetricCard
          label="Entrance Passes"
          value={totalTickets}
          icon={Ticket}
          iconColorClass="text-emerald-700"
          iconBgClass="bg-emerald-50"
          trendText="Generated"
          trendType="positive"
          subtext="Digital passes generated for confirmed attendees"
        />

        <MetricCard
          label="Verified Check-ins"
          value={checkedInTickets}
          icon={CheckCircle2}
          iconColorClass="text-indigo-700"
          iconBgClass="bg-indigo-50"
          trendText={totalTickets > 0 ? `${Math.round((checkedInTickets / totalTickets) * 100)}% attendance` : "0%"}
          trendType="neutral"
          subtext="Attendees admitted through entrance verification"
        />
      </div>

      {/* Main Grid: Parameters & Lifecycle Gates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Event Parameters & Registrations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-5">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">
                Event Parameters & Schedule
              </h2>
              <span className="text-xs font-mono text-zinc-400">ID: {event.id.slice(0, 8)}...</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Event Model</p>
                <p className="text-sm font-semibold text-zinc-900 mt-1 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-zinc-400" />
                  {event.event_type === "FREE" ? "Free Admission" : "Paid Pass"}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 font-medium">Public URL Path</p>
                <p className="text-sm font-mono text-zinc-800 mt-1 font-medium">/{event.slug}</p>
              </div>

              {(event.date_start || event.date_end) && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-zinc-500 font-medium">Scheduled Date & Time</p>
                  <p className="text-sm text-zinc-800 mt-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    {event.date_start && format(new Date(event.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    {event.date_end && ` — ${format(new Date(event.date_end), "h:mm a")}`}
                  </p>
                </div>
              )}

              {event.location && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-zinc-500 font-medium">Venue & Location</p>
                  <p className="text-sm text-zinc-800 mt-1 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {event.location}
                  </p>
                </div>
              )}
            </div>

            {event.description && (
              <div className="pt-3 border-t border-zinc-100 text-xs">
                <p className="text-xs text-zinc-500 font-medium mb-1">Description</p>
                <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          {/* Attendee Registrations Table */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-2xs space-y-0">
            <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/75 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-zinc-900">
                  Recent Registrations
                </h3>
                <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full font-medium">
                  {(registrations || []).length}
                </span>
              </div>
            </div>

            {(registrations || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No attendee registrations recorded yet for this event.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-zinc-600 text-xs font-semibold">
                      <th className="py-2.5 px-4">Attendee</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Date registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {(registrations || []).map((reg: any) => (
                      <tr key={reg.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-zinc-900">{reg.participant_name}</p>
                          <p className="text-xs text-zinc-400">{reg.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={reg.status} />
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-500">
                          {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Registration Form & Lifecycle Gate */}
        <div className="space-y-6">
          {/* Registration Form Quick Summary */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                  Registration Form
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {form?.fields?.length || 0} questions configured
                </p>
              </div>

              <Link href={`/org/events/${event.id}/form`}>
                <Button size="sm" variant="outline" className="text-xs font-semibold shadow-2xs">
                  Configure
                </Button>
              </Link>
            </div>

            <div className="space-y-1.5">
              {(form?.fields || []).slice(0, 5).map((f: any) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs"
                >
                  <span className="font-medium text-zinc-800 truncate">{f.label}</span>
                  {f.required && (
                    <span className="text-xs text-red-500 font-medium shrink-0">
                      Required
                    </span>
                  )}
                </div>
              ))}
              {(form?.fields?.length || 0) > 5 && (
                <p className="text-xs text-center text-zinc-400 pt-1">
                  +{(form?.fields?.length || 0) - 5} more fields
                </p>
              )}
            </div>
          </div>

          {/* Lifecycle State Manager */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="pb-2 border-b border-zinc-100">
              <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                Lifecycle Gates
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Control attendee registration access and entrance turnstile activation.
              </p>
            </div>

            <EventStatusManager eventId={event.id} currentStatus={event.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
