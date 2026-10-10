import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type EventStatusType = "DRAFT" | "PUBLISHED" | "LIVE" | "ENDED" | "CANCELLED";
export type TicketStatusType = "ISSUED" | "CHECKED_IN" | "REVOKED";
export type RegistrationStatusType = "CONFIRMED" | "PENDING_PAYMENT" | "CANCELLED";

export type AnyStatus = EventStatusType | TicketStatusType | RegistrationStatusType | string;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AnyStatus;
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true, className, ...props }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let colorClasses = "bg-zinc-100 text-zinc-700 border-zinc-200";
  let dotColor = "bg-zinc-400";
  let label = status;

  switch (normalized) {
    case "LIVE":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      dotColor = "bg-emerald-500 animate-pulse";
      label = "Live";
      break;
    case "PUBLISHED":
      colorClasses = "bg-sky-50 text-sky-700 border-sky-200/80";
      dotColor = "bg-sky-500";
      label = "Published";
      break;
    case "DRAFT":
      colorClasses = "bg-zinc-100 text-zinc-600 border-zinc-200";
      dotColor = "bg-zinc-400";
      label = "Draft";
      break;
    case "ENDED":
      colorClasses = "bg-zinc-100 text-zinc-500 border-zinc-200";
      dotColor = "bg-zinc-400";
      label = "Ended";
      break;
    case "CANCELLED":
    case "REVOKED":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200/80";
      dotColor = "bg-rose-500";
      label = normalized === "REVOKED" ? "Revoked" : "Cancelled";
      break;
    case "ISSUED":
    case "CONFIRMED":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      dotColor = "bg-emerald-500";
      label = normalized === "ISSUED" ? "Issued" : "Confirmed";
      break;
    case "CHECKED_IN":
      colorClasses = "bg-zinc-100 text-zinc-700 border-zinc-200";
      dotColor = "bg-zinc-500";
      label = "Checked In";
      break;
    case "PENDING_PAYMENT":
    case "PENDING":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200/80";
      dotColor = "bg-amber-500";
      label = "Pending Payment";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border font-sans tracking-tight shrink-0",
        colorClasses,
        className
      )}
      {...props}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />}
      <span>{label}</span>
    </span>
  );
}
