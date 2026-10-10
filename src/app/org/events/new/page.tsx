import { connection } from "next/server";
import { createServerDbClient } from "@/lib/db/server";
import { EventForm } from "@/components/events/event-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Create Event - Ticket Platform",
  description: "Create a new event",
};

export const instant = false;

export default async function NewEventPage() {
  await connection();
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/org" className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-3">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create New Event</h1>
        <p className="text-sm text-zinc-500 mt-1">Configure event metadata and public landing parameters.</p>
      </div>

      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Event Parameters</CardTitle>
          <CardDescription>
            These details appear on the attendee pass and public registration page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm organizationId={orgInfo.organizationId} />
        </CardContent>
      </Card>
    </div>
  );
}
