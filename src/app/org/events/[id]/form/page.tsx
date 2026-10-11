import { connection } from "next/server";
import { getEventById } from "@/app/actions/event.actions";
import { getRegistrationForm } from "@/app/actions/form.actions";
import { createServerDbClient } from "@/lib/db/server";
import { FormBuilder } from "@/components/forms/form-builder";
import { redirect } from "next/navigation";
import { getOrCreateUserOrganization } from "@/lib/db/org-helper";

export const metadata = {
  title: "Registration Form Builder - TicketKoi",
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
    <FormBuilder
      eventId={event.id}
      initialFields={form?.fields || []}
      eventName={event.name}
      eventSlug={event.slug}
    />
  );
}
