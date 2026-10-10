import { connection } from "next/server";
import { getEventById } from "@/app/actions/event.actions";
import { getRegistrationForm } from "@/app/actions/form.actions";
import { createServerDbClient } from "@/lib/db/server";
import { FormBuilder } from "@/components/forms/form-builder";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Registration Form Builder - Ticket Platform",
  description: "Customize the participant registration form for your event",
};

export const instant = false;

export default async function EventFormBuilderPage(props: {
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

  // Get user's organization
  const orgInfo = await getOrCreateUserOrganization(user.id, user.email);

  if (!orgInfo) {
    redirect("/login");
  }

  const event = await getEventById(id);

  // Security check: event must belong to user's organization
  if (event.organization_id !== orgInfo.organizationId) {
    redirect("/org");
  }

  const form = await getRegistrationForm(event.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/org/events/${event.id}`}
            className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to {event.name}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Customize Registration Form
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Design questions for attendees of <span className="font-medium text-zinc-800">{event.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/events/${event.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs font-medium">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
              Public Event Page
            </Button>
          </Link>
        </div>
      </div>

      <FormBuilder
        eventId={event.id}
        initialFields={form?.fields || []}
        eventName={event.name}
        eventSlug={event.slug}
      />
    </div>
  );
}
