import { connection } from "next/server";
import { getEventById } from "@/app/actions/event.actions";
import { createServerDbClient } from "@/lib/db/server";
import { EventForm } from "@/components/events/event-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Edit Event - Ticket Platform",
  description: "Edit event details",
};

export const instant = false;

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/org/events/${id}`} className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-3">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Event Details
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Event</h1>
        <p className="text-sm text-zinc-500 mt-1">Update parameters for this gathering.</p>
      </div>

      <Card className="border-zinc-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Event Parameters</CardTitle>
          <CardDescription>
            Changes take effect immediately on public event pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm 
            organizationId={orgInfo.organizationId} 
            eventId={event.id}
            initialData={event}
          />
        </CardContent>
      </Card>
    </div>
  );
}
