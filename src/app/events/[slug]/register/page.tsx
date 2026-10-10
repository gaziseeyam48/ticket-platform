import { connection } from "next/server";
import { getPublicEventRegistrationData } from "@/app/actions/registration.actions";
import { RegistrationForm } from "@/components/registration/registration-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const params = await props.params;
  try {
    const data = await getPublicEventRegistrationData(params.slug);
    return {
      title: `Register for ${data.event.name} — Ticket Platform`,
      description: data.event.description || `Register for ${data.event.name}`,
    };
  } catch {
    return {
      title: "Registration — Ticket Platform",
    };
  }
}

export default async function EventRegistrationPage(props: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const params = await props.params;
  const { slug } = params;

  let registrationData;
  try {
    registrationData = await getPublicEventRegistrationData(slug);
  } catch {
    notFound();
  }

  const { event, form, isOpen, statusMessage } = registrationData;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Navigation Back */}
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Event Overview
        </Link>

        {/* Closed or unavailable state banner */}
        {!isOpen ? (
          <Card className="border-zinc-200 bg-white shadow-xs p-8 text-center space-y-5">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-900">Registration Unavailable</h2>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                {statusMessage}
              </p>
            </div>

            <div className="pt-2">
              <Link href={`/events/${event.slug}`}>
                <Button variant="outline" size="sm">View Event Details</Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Active Registration Flow */
          <div className="space-y-6">
            {/* Quick Event Summary Header Card */}
            <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {event.event_type}
                </span>
                <span className="text-xs font-mono text-zinc-400">Hosted by {event.organizations.name}</span>
              </div>
              <h1 className="text-xl font-bold text-zinc-900">{event.name}</h1>

              {(event.date_start || event.location) && (
                <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-4 text-xs text-zinc-500">
                  {event.date_start && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{format(new Date(event.date_start), "PPp")}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Form Component */}
            <RegistrationForm event={event} fields={form?.fields || []} />
          </div>
        )}
      </div>
    </div>
  );
}
