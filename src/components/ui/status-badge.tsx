import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type EventStatusType = "DRAFT" | "PUBLISHED" | "LIVE" | "ENDED" | "CANCELLED";
export type TicketStatusType = "ISSUED" | "CHECKED_IN" | "REVOKED";
export type RegistrationStatusType = "CONFIRMED" | "PENDING_PAYMENT" | "CANCELLED";
export type PaymentStatusType = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type VerifierStatusType = "INVITED" | "ACTIVE" | "EXPIRED" | "REVOKED";

export type AnyStatus =
  | EventStatusType
  | TicketStatusType
  | RegistrationStatusType
  | PaymentStatusType
  | VerifierStatusType
  | string;

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AnyStatus;
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true, className, ...props }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let colorClasses = "bg-[#F1F4F8] text-[#525B6B] border-[#DCE1E8]";
  let dotColor = "bg-[#667085]";
  let label = status;

  switch (normalized) {
    case "LIVE":
      colorClasses = "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]";
      dotColor = "bg-[#087F5B] animate-pulse";
      label = "Live";
      break;
    case "PUBLISHED":
      colorClasses = "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
      dotColor = "bg-[#2563EB]";
      label = "Published";
      break;
    case "DRAFT":
      colorClasses = "bg-[#F1F4F8] text-[#525B6B] border-[#DCE1E8]";
      dotColor = "bg-[#667085]";
      label = "Draft";
      break;
    case "ENDED":
      colorClasses = "bg-[#F1F4F8] text-[#667085] border-[#DCE1E8]";
      dotColor = "bg-[#9AA4B2]";
      label = "Ended";
      break;
    case "CANCELLED":
    case "REVOKED":
      colorClasses = "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]";
      dotColor = "bg-[#C2415D]";
      label = normalized === "REVOKED" ? "Revoked" : "Cancelled";
      break;
    case "ISSUED":
    case "CONFIRMED":
      colorClasses = "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]";
      dotColor = "bg-[#087F5B]";
      label = normalized === "ISSUED" ? "Issued" : "Confirmed";
      break;
    case "CHECKED_IN":
      colorClasses = "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]";
      dotColor = "bg-[#087F5B]";
      label = "Checked In";
      break;
    case "PENDING_PAYMENT":
    case "PENDING":
    case "SUBMITTED":
      colorClasses = "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
      dotColor = "bg-[#B96B08]";
      label =
        normalized === "PENDING_PAYMENT"
          ? "Pending Payment"
          : normalized === "SUBMITTED"
          ? "Payment Submitted"
          : "Pending";
      break;
    case "APPROVED":
      colorClasses = "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]";
      dotColor = "bg-[#087F5B]";
      label = "Approved";
      break;
    case "REJECTED":
      colorClasses = "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]";
      dotColor = "bg-[#C2415D]";
      label = "Rejected";
      break;
    case "ACTIVE":
      colorClasses = "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]";
      dotColor = "bg-[#087F5B]";
      label = "Active";
      break;
    case "INVITED":
      colorClasses = "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
      dotColor = "bg-[#2563EB]";
      label = "Invited";
      break;
    case "EXPIRED":
      colorClasses = "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]";
      dotColor = "bg-[#B96B08]";
      label = "Expired";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-sans tracking-normal shrink-0 leading-normal",
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
