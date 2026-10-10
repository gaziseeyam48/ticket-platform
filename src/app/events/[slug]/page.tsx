import { connection } from "next/server";
import { getEventBySlug } from "@/app/actions/event.actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const instant = false;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  await connection();
  const params = await props.params;
  try {
    const event = await getEventBySlug(params.slug);
    return {
      title: `${event.name} — Ticket Platform`,
      description: event.description || `Register for ${event.name}`,
    };
  } catch {
    return {
      title: "Event Not Found",
    };
  }
}

export default async function PublicEventPage(props: { params: Promise<{ slug: string }> }) {
  await connection();
  const params = await props.params;
  
  let event;
  try {
    event = await getEventBySlug(params.slug);
  } catch {
    notFound();
  }

  const isRegistrationOpen = event.status === "PUBLISHED" || event.status === "LIVE";

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 py-10 sm:py-16 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Editorial Masthead Bar */}
        <div className="border-b border-zinc-200 pb-4 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400">
          <span>Official Event Invitation</span>
          <span>{event.organizations.name}</span>
        </div>

        {/* Main Event Article Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-8 sm:p-12 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {event.event_type} PASS
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Presented by {event.organizations.name}
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
                {event.name}
              </h1>
            </div>

            {/* Date and Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
              {(event.date_start || event.date_end) && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-900">Schedule</span>
                    <p className="text-zinc-600 mt-0.5">
                      {event.date_start && format(new Date(event.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      {event.date_end && ` - ${format(new Date(event.date_end), "h:mm a")}`}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-900">Venue</span>
                    <p className="text-zinc-600 mt-0.5">{event.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">About Gathering</h3>
                <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed font-sans">{event.description}</p>
              </div>
            )}

            {/* Registration Action */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-zinc-400">Status</span>
                <p className="text-sm font-semibold text-zinc-900">
                  {isRegistrationOpen ? "Registration Open" : "Registration Closed"}
                </p>
              </div>

              {isRegistrationOpen ? (
                <Link href={`/events/${event.slug}/register`}>
                  <Button size="lg" className="w-full sm:w-auto font-semibold px-6 gap-2">
                    Claim Attendee Pass
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button disabled variant="outline" size="lg" className="w-full sm:w-auto">
                  Registration Closed
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs font-mono text-zinc-400">
          Powered by TicketPlatform • Accountless Attendee Verification
        </p>
      </div>
    </div>
  );
}
