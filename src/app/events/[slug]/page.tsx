import { getEventBySlug } from "@/app/actions/event.actions";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const instant = false;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const event = await getEventBySlug(params.slug);
    return {
      title: `${event.name} - Ticket Platform`,
      description: event.description || `Register for ${event.name}`,
    };
  } catch (error) {
    return {
      title: "Event Not Found",
    };
  }
}

export default async function PublicEventPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  let event;
  try {
    event = await getEventBySlug(params.slug);
  } catch (error) {
    notFound();
  }

  const isRegistrationOpen = event.status === "PUBLISHED" || event.status === "LIVE";

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
          <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-b border-zinc-800" />
          
          <CardContent className="p-8 sm:p-12 -mt-12 sm:-mt-16 bg-zinc-950/40 backdrop-blur-sm rounded-b-xl">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              <div className="flex-1 space-y-6">
                <div>
                  <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-4">
                    {event.event_type} EVENT
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    {event.name}
                  </h1>
                  <p className="text-lg text-zinc-400 font-medium">
                    Presented by {event.organizations.name}
                  </p>
                </div>

                <div className="flex flex-col gap-4 py-6 border-y border-zinc-800/60">
                  {(event.date_start || event.date_end) && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-zinc-200">Date & Time</p>
                        <p className="text-zinc-400 mt-1">
                          {event.date_start && format(new Date(event.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                          {event.date_end && ` - ${format(new Date(event.date_end), "h:mm a")}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-zinc-200">Location</p>
                        <p className="text-zinc-400 mt-1">{event.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {event.description && (
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <h3 className="text-xl font-semibold text-zinc-200 mb-4">About this event</h3>
                    <p className="text-zinc-300 whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80">
                <Card className="bg-zinc-900 border-zinc-800 sticky top-8">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Registration</h3>
                    
                    {!isRegistrationOpen ? (
                      <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg text-center border border-zinc-700/50">
                        <p className="text-zinc-300 font-medium">Registration is currently closed.</p>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        <Button className="w-full text-lg h-12" size="lg">
                          Register Now
                        </Button>
                        <p className="text-xs text-center text-zinc-500">
                          {event.event_type === "FREE" ? "Free registration" : "Paid event"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
