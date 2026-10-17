"use client";

import {
  Users,
  Ticket,
  CheckCircle2,
  Calendar,
  FileText,
  ShieldCheck,
  CreditCard,
  Ban,
  Clock,
} from "lucide-react";
import {
  EventLifecycleStatus,
  PublicationChecklistResult,
} from "./workspace-status-config";
import { cn } from "@/lib/utils/cn";

interface WorkspaceContextualMetricsProps {
  status: EventLifecycleStatus;
  isPaid: boolean;
  metrics: {
    registrationsCount: number;
    ticketsCount: number;
    checkedInCount: number;
    pendingPaymentsCount: number;
  };
  checklist?: PublicationChecklistResult;
  formFieldsCount: number;
  event: {
    date_start?: string | null;
    location?: string | null;
    payment_config?: any;
  };
  verifiersCount: number;
}

export function WorkspaceContextualMetrics({
  status,
  isPaid,
  metrics,
  checklist,
  formFieldsCount,
  event,
}: WorkspaceContextualMetricsProps) {
  const checkinPercentage =
    metrics.ticketsCount > 0
      ? ((metrics.checkedInCount / metrics.ticketsCount) * 100).toFixed(1)
      : "0";

  const remainingAttendees = Math.max(0, metrics.ticketsCount - metrics.checkedInCount);

  // Define exactly 3 essential metrics per status
  type MetricItem = {
    label: string;
    value: string | number;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor?: string;
  };

  let items: MetricItem[] = [];

  if (status === "DRAFT") {
    items = [
      {
        label: "Setup Progress",
        value: checklist ? `${checklist.completedCount} of ${checklist.totalCount}` : "In Progress",
        subtext: checklist?.isReadyToPublish ? "Ready to publish" : "Requirements incomplete",
        icon: ShieldCheck,
        accentColor: checklist?.isReadyToPublish ? "text-emerald-600" : "text-amber-600",
      },
      {
        label: "Form Questions",
        value: formFieldsCount,
        subtext: formFieldsCount > 0 ? "Attendee fields configured" : "Questions required",
        icon: FileText,
        accentColor: formFieldsCount > 0 ? "text-blue-600" : "text-amber-600",
      },
      {
        label: "Event Schedule",
        value: event.date_start ? "Configured" : "Unspecified",
        subtext: event.date_start ? "Date & venue set" : "Specify in Edit Details",
        icon: Calendar,
        accentColor: event.date_start ? "text-zinc-700" : "text-amber-600",
      },
    ];
  } else if (status === "PUBLISHED") {
    items = [
      {
        label: "Total Registrations",
        value: metrics.registrationsCount,
        subtext: "Submissions received",
        icon: Users,
        accentColor: "text-blue-600",
      },
      {
        label: "Passes Issued",
        value: metrics.ticketsCount,
        subtext: "Digital passes dispatched",
        icon: Ticket,
        accentColor: "text-purple-600",
      },
      isPaid && metrics.pendingPaymentsCount > 0
        ? {
            label: "Pending Payments",
            value: metrics.pendingPaymentsCount,
            subtext: "Claims requiring review",
            icon: CreditCard,
            accentColor: "text-amber-600",
          }
        : {
            label: "Check-ins",
            value: metrics.checkedInCount,
            subtext: "Gates activate at start",
            icon: CheckCircle2,
            accentColor: "text-emerald-600",
          },
    ];
  } else if (status === "LIVE") {
    items = [
      {
        label: "Admitted Attendees",
        value: metrics.checkedInCount,
        subtext: `${checkinPercentage}% of pass holders`,
        icon: CheckCircle2,
        accentColor: "text-emerald-600",
      },
      {
        label: "Passes Issued",
        value: metrics.ticketsCount,
        subtext: "Total entrance tickets",
        icon: Ticket,
        accentColor: "text-purple-600",
      },
      {
        label: "Awaiting Arrival",
        value: remainingAttendees,
        subtext: "Pending entrance scan",
        icon: Users,
        accentColor: "text-blue-600",
      },
    ];
  } else if (status === "ENDED") {
    items = [
      {
        label: "Final Turnout",
        value: `${checkinPercentage}%`,
        subtext: `${metrics.checkedInCount} of ${metrics.ticketsCount} attended`,
        icon: CheckCircle2,
        accentColor: "text-emerald-600",
      },
      {
        label: "Attendees Admitted",
        value: metrics.checkedInCount,
        subtext: "Turnstile scans recorded",
        icon: Users,
        accentColor: "text-blue-600",
      },
      {
        label: "Total Passes Issued",
        value: metrics.ticketsCount,
        subtext: "Gross passes issued",
        icon: Ticket,
        accentColor: "text-purple-600",
      },
    ];
  } else {
    // CANCELLED
    items = [
      {
        label: "Pre-cancellation Signups",
        value: metrics.registrationsCount,
        subtext: "Attendee records preserved",
        icon: Users,
        accentColor: "text-zinc-600",
      },
      {
        label: "Passes Voided",
        value: metrics.ticketsCount,
        subtext: "Entrance access disabled",
        icon: Ticket,
        accentColor: "text-rose-600",
      },
      {
        label: "Lifecycle State",
        value: "Cancelled",
        subtext: "Operations suspended",
        icon: Ban,
        accentColor: "text-rose-600",
      },
    ];
  }

  return (
    <section
      data-tour="ticket-metrics"
      aria-label="Event Key Metrics"
      className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 grid grid-cols-1 sm:grid-cols-3"
    >
      {items.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-medium text-zinc-500 block truncate">
                {item.label}
              </span>
              <div className="text-2xl font-bold tracking-tight text-zinc-900">
                {item.value}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {item.subtext}
              </p>
            </div>
            <div
              className={cn(
                "w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0",
                item.accentColor
              )}
            >
              <IconComponent className="h-4 w-4" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
