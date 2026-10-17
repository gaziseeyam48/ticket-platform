import { connection } from "next/server";
import { getAdminClient } from "@/lib/db/admin";
import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/db/cached-session";
import { TicketDesignStudio } from "@/components/ticket-design/ticket-design-studio";
import { DEFAULT_TICKET_DESIGN, TicketDesignConfig } from "@/lib/types/ticket-design";
import { generateQrCodeDataUrl } from "@/lib/services/qr.service";

export const metadata = {
  title: "Customize Ticket — TicketKoi",
  description: "Personalize the attendee digital admission pass for your event",
};

export const instant = false;

export default async function TicketDesignPage(props: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const params = await props.params;
  const { id } = params;

  // Session verification from cached session
  const { user, orgInfo } = await getCachedSession();
  if (!user || !orgInfo) {
    redirect("/login");
  }

  const adminDb = getAdminClient();
  // Fetch event using valid schema column names (* or name, slug, date_start, date_end, location, organization_id, settings)
  const { data: event, error } = await (adminDb
    .from("events")
    .select("*")
    .eq("id", id)
    .single() as any);

  if (error || !event) {
    console.error("Failed to load event for ticket design:", error);
    redirect("/org/events");
  }

  // Security check: event must belong to the user's organization
  if (event.organization_id !== orgInfo.organizationId) {
    redirect("/org");
  }

  const savedDesign: TicketDesignConfig =
    event.settings?.ticket_design || DEFAULT_TICKET_DESIGN;

  // Pre-generate a high-contrast sample QR code for the live preview
  let sampleQrCode = "";
  try {
    sampleQrCode = await generateQrCodeDataUrl(
      `https://ticketkoi.com/sample-pass-${event.id.slice(0, 8)}`
    );
  } catch {
    sampleQrCode = "";
  }

  return (
    <TicketDesignStudio
      eventId={event.id}
      initialDesign={savedDesign}
      event={{
        id: event.id,
        name: event.name,
        slug: event.slug,
        date_start: event.date_start,
        date_end: event.date_end,
        location: event.location,
      }}
      organization={{
        id: orgInfo.organizationId,
        name: orgInfo.organization.name,
      }}
      sampleQrCode={sampleQrCode}
    />
  );
}
