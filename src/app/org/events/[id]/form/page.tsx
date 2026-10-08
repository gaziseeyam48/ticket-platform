import { getEventById } from "@/app/actions/event.actions";
import { getRegistrationForm } from "@/app/actions/form.actions";
import { createServerDbClient } from "@/lib/db/server";
import { FormBuilder } from "@/components/forms/form-builder";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Registration Form Builder - Ticket Platform",
  description: "Customize the participant registration form for your event",
};

export const instant = false;

export default async function EventFormBuilderPage(props: {
  params: Promise<{ id: string }>;
}) {
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
  const { data: orgUser } = await (supabase
    .from("organization_users")
    .select("organization_id")
    .eq("user_id", user.id)
    .single() as any);

  if (!orgUser) {
    redirect("/login");
  }

  const event = await getEventById(id);

  // Security check: event must belong to user's organization
  if (event.organization_id !== orgUser.organization_id) {
    redirect("/org");
  }

  const form = await getRegistrationForm(event.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/org/events/${event.id}`}
            className="inline-flex items-center text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {event.name}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Customize Registration Form
          </h1>
          <p className="text-zinc-400 mt-1">
            Build and preview custom questions for your attendees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/events/${event.slug}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
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
