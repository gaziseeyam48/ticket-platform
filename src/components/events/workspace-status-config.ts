import { LucideIcon } from "lucide-react";

export type EventLifecycleStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "LIVE"
  | "ENDED"
  | "CANCELLED";

export interface PublicationChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  actionLabel?: string;
  actionHref?: string;
  actionTab?: string;
}

export interface PublicationChecklistResult {
  items: PublicationChecklistItem[];
  isReadyToPublish: boolean;
  completedCount: number;
  totalCount: number;
}

/**
 * Evaluates the publication checklist using real saved data and backend validation rules.
 */
export function evaluatePublicationChecklist(
  event: {
    id: string;
    name?: string | null;
    slug?: string | null;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    date_end?: string | null;
    location?: string | null;
    payment_config?: any;
  },
  form: {
    id?: string;
    fields?: Array<any>;
  } | null
): PublicationChecklistResult {
  const isPaid = event.event_type === "PAID";
  const fields = form?.fields || [];

  // 1. Event details & schedule
  const hasBasicDetails = Boolean(
    event.name?.trim() &&
    event.slug?.trim() &&
    event.date_start &&
    event.location?.trim()
  );

  // 2. Registration form configured (must have at least one question)
  const hasConfiguredForm = fields.length > 0;

  // 3. Admission & ticket settings
  const hasValidAdmission = isPaid
    ? Boolean(
        event.payment_config &&
        event.payment_config.payment_method?.trim() &&
        event.payment_config.account_number?.trim() &&
        parseFloat(event.payment_config.amount) > 0
      )
    : true; // Free events require no payment config

  const items: PublicationChecklistItem[] = [
    {
      id: "details",
      label: "Event Details & Schedule",
      description: hasBasicDetails
        ? "Schedule, venue location, and event identity parameters set."
        : "Set the start date, time, and venue location for attendees.",
      isComplete: hasBasicDetails,
      actionLabel: hasBasicDetails ? "Edit Schedule" : "Complete Details",
      actionHref: `/org/events/${event.id}/edit`,
    },
    {
      id: "form",
      label: "Registration Form Questions",
      description: hasConfiguredForm
        ? `${fields.length} attendee question${fields.length === 1 ? "" : "s"} configured for registration.`
        : "At least one attendee question is required before publication.",
      isComplete: hasConfiguredForm,
      actionLabel: hasConfiguredForm ? "Edit Form" : "Build Form",
      actionHref: `/org/events/${event.id}/form`,
    },
    {
      id: "admission",
      label: isPaid ? "Payment & Banking Setup" : "Free Admission Model",
      description: isPaid
        ? hasValidAdmission
          ? `${event.payment_config.amount} ${event.payment_config.currency || "USD"} via ${event.payment_config.payment_method}.`
          : "Configure recipient account and pass price for attendee payments."
        : "Free pass model active. Passes are issued automatically on registration.",
      isComplete: hasValidAdmission,
      actionLabel: isPaid ? (hasValidAdmission ? "Edit Banking" : "Set Banking") : undefined,
      actionHref: isPaid ? `/org/events/${event.id}/edit` : undefined,
    },
    {
      id: "readiness",
      label: "Publication Readiness",
      description:
        hasBasicDetails && hasConfiguredForm && hasValidAdmission
          ? "All publication requirements verified. Ready to accept attendee signups."
          : "Complete missing configuration items above to enable publishing.",
      isComplete: hasBasicDetails && hasConfiguredForm && hasValidAdmission,
    },
  ];

  const completedCount = items.filter((i) => i.isComplete).length;
  // Publication readiness requires details, form, and admission
  const isReadyToPublish = hasBasicDetails && hasConfiguredForm && hasValidAdmission;

  return {
    items,
    isReadyToPublish,
    completedCount,
    totalCount: items.length,
  };
}

export interface WorkspaceStatusConfig {
  status: EventLifecycleStatus;
  statusBadgeLabel: string;
  headline: string;
  objectiveDescription: string;
  focusText: string;
  nextMeaningfulAction: string;
  blockerMessage?: string;
  primaryAction: {
    label: string;
    actionType:
      | "build_form"
      | "edit_details"
      | "publish_event"
      | "start_event"
      | "open_scanner"
      | "view_registrations"
      | "none";
    href?: string;
    variant: "primary" | "positive" | "outline" | "secondary";
  };
  allowedTransitions: EventLifecycleStatus[];
}

/**
 * Returns the status-specific workspace configuration based on persisted backend status.
 */
export function getWorkspaceStatusConfig(
  event: {
    id: string;
    name?: string | null;
    slug?: string | null;
    status: string;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    date_end?: string | null;
    location?: string | null;
    payment_config?: any;
  },
  form: {
    id?: string;
    fields?: Array<any>;
  } | null,
  metrics: {
    registrationsCount: number;
    ticketsCount: number;
    checkedInCount: number;
    pendingPaymentsCount: number;
  }
): WorkspaceStatusConfig {
  const normalizedStatus = (event.status || "DRAFT").toUpperCase() as EventLifecycleStatus;
  const isPaid = event.event_type === "PAID";
  const fields = form?.fields || [];
  const checklist = evaluatePublicationChecklist(event, form);

  switch (normalizedStatus) {
    case "DRAFT": {
      let primaryActionLabel = "Publish Event";
      let primaryActionType: WorkspaceStatusConfig["primaryAction"]["actionType"] = "publish_event";
      let primaryActionHref: string | undefined = undefined;
      let primaryVariant: WorkspaceStatusConfig["primaryAction"]["variant"] = "primary";
      let blockerMessage: string | undefined = undefined;

      if (!checklist.items.find((i) => i.id === "form")?.isComplete) {
        primaryActionLabel = "Build Registration Form";
        primaryActionType = "build_form";
        primaryActionHref = `/org/events/${event.id}/form`;
        blockerMessage = "Registration form requires at least one question before publication.";
      } else if (!checklist.items.find((i) => i.id === "details")?.isComplete) {
        primaryActionLabel = "Complete Event Schedule";
        primaryActionType = "edit_details";
        primaryActionHref = `/org/events/${event.id}/edit`;
        blockerMessage = "Specify start date and venue location to complete publication requirements.";
      } else if (!checklist.items.find((i) => i.id === "admission")?.isComplete) {
        primaryActionLabel = "Complete Payment Setup";
        primaryActionType = "edit_details";
        primaryActionHref = `/org/events/${event.id}/edit`;
        blockerMessage = "Banking instructions and ticket pricing are required for paid events.";
      } else {
        primaryActionLabel = "Publish Event";
        primaryActionType = "publish_event";
        primaryVariant = "primary";
      }

      return {
        status: "DRAFT",
        statusBadgeLabel: "Draft Mode",
        headline: "Complete Event Setup & Publish",
        objectiveDescription:
          "This event is private and closed to attendee registration. Complete the setup checklist and publish when ready to accept registrations.",
        focusText: checklist.isReadyToPublish
          ? "All setup requirements are satisfied. Publish this event to make the registration link publicly active."
          : "Work through the setup checklist below to prepare your event for public launch.",
        nextMeaningfulAction: checklist.isReadyToPublish
          ? "Publish event to begin accepting public registrations."
          : blockerMessage || "Complete required configuration fields.",
        blockerMessage,
        primaryAction: {
          label: primaryActionLabel,
          actionType: primaryActionType,
          href: primaryActionHref,
          variant: primaryVariant,
        },
        allowedTransitions: ["PUBLISHED", "CANCELLED"],
      };
    }

    case "PUBLISHED": {
      const hasPendingPayments = isPaid && metrics.pendingPaymentsCount > 0;
      const isEligibleToStart = true;

      return {
        status: "PUBLISHED",
        statusBadgeLabel: "Registration Open",
        headline: "Manage Registrations & Event Readiness",
        objectiveDescription:
          "Public registration is live. Attendees can submit the form and receive digital entrance tickets. Prepare entrance staff and turnstiles for event day.",
        focusText: hasPendingPayments
          ? `${metrics.pendingPaymentsCount} attendee payment claim${metrics.pendingPaymentsCount === 1 ? " requires" : "s require"} manual verification before entrance passes are issued.`
          : metrics.registrationsCount > 0
          ? `${metrics.registrationsCount} attendees registered (${metrics.ticketsCount} entrance pass${metrics.ticketsCount === 1 ? "" : "es"} generated). When ready on event day, start the event to open entrance gates.`
          : "Your public registration page is accepting guests. Share your link to drive attendee signups.",
        nextMeaningfulAction: hasPendingPayments
          ? "Review pending attendee payment submissions in the Payments tab."
          : "Start event to open turnstile gates when event day begins.",
        blockerMessage: undefined,
        primaryAction: {
          label: "Start Event (Go Live)",
          actionType: "start_event",
          variant: "positive",
        },
        allowedTransitions: ["LIVE", "CANCELLED", "ENDED"],
      };
    }

    case "LIVE": {
      return {
        status: "LIVE",
        statusBadgeLabel: "Event Live",
        headline: "Entrance Gate Operations Active",
        objectiveDescription:
          "The event is currently underway. QR verification scanners and entrance turnstiles are authorized for real-time attendee admission.",
        focusText:
          metrics.checkedInCount > 0
            ? `${metrics.checkedInCount} attendees admitted through entrance turnstiles so far (${Math.max(0, metrics.ticketsCount - metrics.checkedInCount)} awaiting arrival).`
            : "No attendees have scanned in yet. Launch the turnstile scanner to begin processing arrivals.",
        nextMeaningfulAction: "Process arriving attendees using the gate verification scanner.",
        primaryAction: {
          label: "Open Gate Scanner",
          actionType: "open_scanner",
          href: `/verify?event_id=${event.id}`,
          variant: "positive",
        },
        allowedTransitions: ["ENDED", "CANCELLED"],
      };
    }

    case "ENDED": {
      const checkinPct =
        metrics.ticketsCount > 0
          ? ((metrics.checkedInCount / metrics.ticketsCount) * 100).toFixed(1)
          : "0.0";

      return {
        status: "ENDED",
        statusBadgeLabel: "Event Concluded",
        headline: "Event Concluded & Historical Archive",
        objectiveDescription:
          "This event has officially ended. Turnstile gates and QR verification scanners are permanently closed.",
        focusText: `Final attendance turnout reached ${checkinPct}% (${metrics.checkedInCount} of ${metrics.ticketsCount} ticket holders checked in). Historical attendance and ticket records are preserved.`,
        nextMeaningfulAction: "Review final attendance records and export registration logs.",
        primaryAction: {
          label: "View All Registrations",
          actionType: "view_registrations",
          variant: "secondary",
        },
        allowedTransitions: [],
      };
    }

    case "CANCELLED": {
      return {
        status: "CANCELLED",
        statusBadgeLabel: "Event Cancelled",
        headline: "Event Cancelled",
        objectiveDescription:
          "This event has been cancelled. Public registration is offline and all generated entrance tickets have been voided.",
        focusText:
          "Turnstile gates will reject any previously issued tickets for this event. No operational or live actions can be performed.",
        nextMeaningfulAction: "Historical records are retained for auditing and participant reference.",
        primaryAction: {
          label: "View Archived Registrations",
          actionType: "view_registrations",
          variant: "outline",
        },
        allowedTransitions: [],
      };
    }
  }
}
