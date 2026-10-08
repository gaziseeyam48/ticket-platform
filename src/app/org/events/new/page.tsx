import { createServerDbClient } from "@/lib/db/server";
import { EventForm } from "@/components/events/event-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Create Event - Ticket Platform",
  description: "Create a new event",
};

export const instant = false;

export default async function NewEventPage() {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/org" className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Create New Event</h1>
        <p className="text-zinc-400 mt-2">Set up the basic details for your event. You can configure registration and tickets later.</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            These details will be shown on the public event page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm organizationId={orgUser.organization_id} />
        </CardContent>
      </Card>
    </div>
  );
}
