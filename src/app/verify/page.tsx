import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";
import { getEvents } from "@/app/actions/event.actions";
import { VerificationScanner } from "@/components/verification/verification-scanner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Entrance Verification — Ticket Platform",
  description: "Atomic entrance QR pass verification and turnstile check-in station",
};

export const instant = false;

export default async function VerifyPage(props: {
  searchParams: Promise<{ event_id?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const targetEventId = searchParams?.event_id;

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

  const events = await getEvents(orgInfo.organizationId);

  const liveEvents = events.filter((e: any) => e.status === "LIVE");
  const publishedEvents = events.filter((e: any) => e.status === "PUBLISHED");
  const draftEvents = events.filter((e: any) => e.status === "DRAFT");
  const endedEvents = events.filter((e: any) => e.status === "ENDED" || e.status === "CANCELLED");

  // CASE 1: Specific event requested via URL
  if (targetEventId) {
    const selectedEvent = events.find((e: any) => e.id === targetEventId);

    if (!selectedEvent) {
      redirect("/verify");
    }

    // Sub-case 1A: Event is LIVE -> Open active scanner for this event
    if (selectedEvent.status === "LIVE") {
      return (
        <VerificationScanner
          organizationName={orgInfo.organization.name}
          selectedEvent={selectedEvent}
          availableEvents={liveEvents}
        />
      );
    }

    // Sub-case 1B: Event is PUBLISHED or DRAFT -> Not yet started
    if (selectedEvent.status === "PUBLISHED" || selectedEvent.status === "DRAFT") {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans p-4 sm:p-6">
          <header className="h-14 border-b border-zinc-800 flex items-center justify-between max-w-lg w-full mx-auto">
            <Link
              href="/org"
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <StatusBadge status={selectedEvent.status} />
          </header>

          <main className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Gate Not Yet Active
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {selectedEvent.name}
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Entrance verification is not yet open. This event is currently in{" "}
                <span className="text-white font-medium">{selectedEvent.status}</span> status. To accept attendee check-ins, the event must be transitioned to <span className="text-emerald-400 font-medium">LIVE</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left w-full space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-white font-medium">{selectedEvent.event_type} Pass</span>
              </div>
              {selectedEvent.date_start && (
                <div className="flex justify-between">
                  <span>Start time:</span>
                  <span className="text-white font-medium">
                    {format(new Date(selectedEvent.date_start), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full space-y-2 pt-2">
              <Link href={`/org/events/${selectedEvent.id}`} className="block w-full">
                <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs h-11 rounded-xl">
                  Manage Event Lifecycle Gates
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>

              <Link href="/verify" className="block w-full">
                <Button variant="ghost" className="w-full text-zinc-400 hover:text-white text-xs h-10">
                  Select Another Event
                </Button>
              </Link>
            </div>
          </main>
        </div>
      );
    }

    // Sub-case 1C: Event is ENDED or CANCELLED -> Closed
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans p-4 sm:p-6">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between max-w-lg w-full mx-auto">
          <Link
            href="/org"
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <StatusBadge status={selectedEvent.status} />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <XCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Gate Closed
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {selectedEvent.name}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
              This event has {selectedEvent.status.toLowerCase()}. Entrance verification has concluded and passes are no longer being admitted.
            </p>
          </div>

          <div className="w-full pt-4 space-y-2">
            <Link href="/verify" className="block w-full">
              <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs h-11 rounded-xl">
                Choose Active Event
              </Button>
            </Link>
            <Link href="/org" className="block w-full">
              <Button variant="ghost" className="w-full text-zinc-400 hover:text-white text-xs h-10">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // CASE 2: No event specified in URL, but exactly ONE live event exists
  if (liveEvents.length === 1) {
    return (
      <VerificationScanner
        organizationName={orgInfo.organization.name}
        selectedEvent={liveEvents[0]}
        availableEvents={liveEvents}
      />
    );
  }

  // CASE 3: Multiple live events exist -> Present gate selector so operator picks the gate
  if (liveEvents.length > 1) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans p-4 sm:p-6">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between max-w-xl w-full mx-auto">
          <Link
            href="/org"
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {liveEvents.length} Active Gates
            </span>
          </div>
        </header>

        <main className="flex-1 max-w-xl w-full mx-auto py-8 space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Select Entrance Gate
            </h1>
            <p className="text-sm text-zinc-400">
              Multiple events are currently LIVE. Select which event turnstile you are operating.
            </p>
          </div>

          <div className="space-y-3">
            {liveEvents.map((event: any) => (
              <Link
                key={event.id}
                href={`/verify?event_id=${event.id}`}
                className="block p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/80 transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Turnstile Active
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {event.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="font-mono">/{event.slug}</span>
                      {event.location && <span>• {event.location}</span>}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
                    >
                      <QrCode className="h-3.5 w-3.5 mr-1" />
                      Open Scanner
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // CASE 4: No live events exist
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans p-4 sm:p-6">
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between max-w-xl w-full mx-auto">
        <Link
          href="/org"
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <span className="text-xs text-zinc-500 font-medium">Entrance Stations</span>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
          <QrCode className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Station Standby
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            No Events Currently Live
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Entrance verification operates only when an event is transitioned to <span className="text-emerald-400 font-medium">LIVE</span> status.
          </p>
        </div>

        {publishedEvents.length > 0 && (
          <div className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-left space-y-3">
            <p className="text-xs font-semibold text-zinc-300">
              Upcoming / Published Events ({publishedEvents.length}):
            </p>
            <div className="space-y-2">
              {publishedEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-white truncate">{ev.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">/{ev.slug}</p>
                  </div>
                  <Link href={`/org/events/${ev.id}`}>
                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs text-zinc-300 border-zinc-700 hover:bg-zinc-800 shrink-0">
                      Go Live ↗
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full pt-2 space-y-2">
          <Link href="/org/events" className="block w-full">
            <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-xs h-11 rounded-xl">
              View Events Directory
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
