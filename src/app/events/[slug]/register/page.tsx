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
  const params = await props.params;
  try {
    const data = await getPublicEventRegistrationData(params.slug);
    return {
      title: `Register for ${data.event.name} - Ticket Platform`,
      description: data.event.description || `Register for ${data.event.name}`,
    };
  } catch {
    return {
      title: "Registration - Ticket Platform",
    };
  }
}

export default async function EventRegistrationPage(props: {
  params: Promise<{ slug: string }>;
}) {
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
    <div className="min-h-screen bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Back */}
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event Overview
        </Link>

        {/* Closed or unavailable state banner */}
        {!isOpen ? (
          <Card className="bg-zinc-900/90 border-zinc-800 shadow-xl p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-100">Registration Unavailable</h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto">
                {statusMessage}
              </p>
            </div>

            <div className="pt-2">
              <Link href={`/events/${event.slug}`}>
                <Button variant="outline">View Event Details</Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Active Registration Flow */
          <div className="space-y-6">
            {/* Quick Event Summary Header Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur space-y-3">
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {event.event_type} EVENT
                </span>
                <h1 className="text-2xl font-bold text-zinc-100 mt-2">{event.name}</h1>
                <p className="text-xs text-zinc-400">Hosted by {event.organizations.name}</p>
              </div>

              {(event.date_start || event.location) && (
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-4 text-xs text-zinc-400">
                  {event.date_start && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{format(new Date(event.date_start), "PPp")}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400" />
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
