"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  Users,
  Ticket,
  Clock,
  Calendar,
  CreditCard,
  Copy,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils/cn";

interface WorkspaceEndedViewProps {
  event: {
    id: string;
    name: string;
    slug: string;
    status: string;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    location?: string | null;
    payment_config?: any;
  };
  metrics: {
    registrationsCount: number;
    ticketsCount: number;
    checkedInCount: number;
    pendingPaymentsCount: number;
  };
  tickets: Array<{
    id: string;
    ticket_number: string;
    status: string;
    participant_name: string;
    participant_email: string;
    issued_at: string;
    checked_in_at?: string | null;
  }>;
  onTabChange: (tab: "overview" | "registrations" | "tickets" | "payments" | "verifiers") => void;
  onCopySummary: () => void;
  copiedSummary: boolean;
}

export function WorkspaceEndedView({
  event,
  metrics,
  tickets,
  onTabChange,
  onCopySummary,
  copiedSummary,
}: WorkspaceEndedViewProps) {
  const isPaid = event.event_type === "PAID";
  const checkinPercentage =
    metrics.ticketsCount > 0
      ? ((metrics.checkedInCount / metrics.ticketsCount) * 100).toFixed(1)
      : "0.0";

  const absentCount = Math.max(0, metrics.ticketsCount - metrics.checkedInCount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ========================================================================= */}
      {/* MAIN LEFT WORKSPACE (8 COLS): OUTCOME HERO & HISTORICAL ATTENDANCE */}
      {/* ========================================================================= */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Event Outcome & Closeout Summary (Hero Card) */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F4F8]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#667085]" />
                <h3 className="text-base sm:text-lg font-bold text-[#171923]">
                  Event Closeout & Attendance Outcome
                </h3>
              </div>
              <p className="text-xs text-[#525B6B] mt-1 leading-relaxed">
                This event has officially ended. Entrance gate scanners are closed and all attendance records are preserved for reporting.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onCopySummary}
              className="text-xs font-semibold gap-1.5 shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-[#525B6B]" />
              <span>{copiedSummary ? "Summary Copied!" : "Copy Outcome Summary"}</span>
            </Button>
          </div>

          {/* Outcome Breakdown Visual Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#171923]">
                Final Attendance Turnout: {metrics.checkedInCount} of {metrics.ticketsCount} Ticket Holders
              </span>
              <span className="font-bold text-[#06694A] font-mono text-sm">
                {checkinPercentage}%
              </span>
            </div>

            {/* Attendance Bar */}
            <div className="w-full h-3 rounded-full bg-[#E9EDF2] overflow-hidden flex">
              <div
                className="h-full bg-[#087F5B] transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, parseFloat(checkinPercentage))}%` }}
                title={`Attended: ${checkinPercentage}%`}
              />
              <div
                className="h-full bg-[#CBD5E1]"
                style={{ width: `${Math.max(0, 100 - parseFloat(checkinPercentage))}%` }}
                title={`Absent: ${(100 - parseFloat(checkinPercentage)).toFixed(1)}%`}
              />
            </div>

            {/* Attendance Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
                <span className="text-[#525B6B] text-[11px]">Registered:</span>
                <p className="font-bold text-base text-[#171923] mt-0.5">
                  {metrics.registrationsCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
                <span className="text-[#525B6B] text-[11px]">Passes Issued:</span>
                <p className="font-bold text-base text-[#171923] mt-0.5">
                  {metrics.ticketsCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#E6F7F0] border border-[#A3E6CD]">
                <span className="text-[#06694A] text-[11px] font-medium">Attended:</span>
                <p className="font-bold text-base text-[#06694A] mt-0.5">
                  {metrics.checkedInCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
                <span className="text-[#525B6B] text-[11px]">Absent:</span>
                <p className="font-bold text-base text-[#667085] mt-0.5">
                  {absentCount}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Reconciliation Box (Paid Events Only) */}
          {isPaid && (
            <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#FDE68A] text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#78350F] font-semibold">
                <CreditCard className="h-4 w-4" />
                <span>Financial Settlement Summary</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[#92400E]">Confirmed Passes:</span>
                  <p className="font-bold text-[#78350F] text-sm">{metrics.ticketsCount}</p>
                </div>
                <div>
                  <span className="text-[#92400E]">Pass Price:</span>
                  <p className="font-bold text-[#78350F] text-sm">
                    {event.payment_config?.amount || 0} {event.payment_config?.currency || "USD"}
                  </p>
                </div>
                <div>
                  <span className="text-[#92400E]">Estimated Gross:</span>
                  <p className="font-bold text-[#78350F] text-sm">
                    {(metrics.ticketsCount * parseFloat(event.payment_config?.amount || "0")).toFixed(2)}{" "}
                    {event.payment_config?.currency || "USD"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Historical Attendance Records Table */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#DCE1E8] bg-[#F1F4F8]/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#525B6B]" />
              <h3 className="text-xs font-semibold text-[#171923]">
                Historical Attendance Records
              </h3>
              <span className="text-xs text-[#525B6B] bg-white border border-[#DCE1E8] px-2 py-0.5 rounded-full font-medium">
                {tickets.length} Passes
              </span>
            </div>

            <button
              type="button"
              onClick={() => onTabChange("registrations")}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Records</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] font-semibold">
                  <th className="py-2.5 px-4">Attendee</th>
                  <th className="py-2.5 px-4">Pass #</th>
                  <th className="py-2.5 px-4">Attendance Outcome</th>
                  <th className="py-2.5 px-4">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                {tickets.slice(0, 10).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#171923]">{ticket.participant_name}</p>
                      <p className="text-xs text-[#667085]">{ticket.participant_email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#171923]">
                      #{ticket.ticket_number}
                    </td>
                    <td className="py-3 px-4">
                      {ticket.status === "CHECKED_IN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F7F0] text-[#06694A] border border-[#A3E6CD]">
                          <CheckCircle2 className="h-3 w-3" />
                          Attended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F4F8] text-[#667085] border border-[#DCE1E8]">
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#525B6B]">
                      {ticket.checked_in_at
                        ? format(new Date(ticket.checked_in_at), "MMM d, yyyy h:mm a")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Archived Parameters Card */}
        <div
          data-tour="event-parameters"
          className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F4F8]">
            <h3 className="text-xs font-semibold text-[#171923]">
              Archived Event Parameters & Location
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
              <span className="text-[#525B6B]">Held On:</span>
              <p className="font-semibold text-[#171923] mt-0.5">
                {event.date_start ? format(new Date(event.date_start), "EEEE, MMMM d, yyyy") : "—"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
              <span className="text-[#525B6B]">Venue:</span>
              <p className="font-semibold text-[#171923] mt-0.5 truncate">
                {event.location || "Location not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDEBAR (4 COLS): ARCHIVED ACTIONS & AUDIT SUMMARY */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-semibold text-[#171923] flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#667085]" />
            Post-Event Closeout Notice
          </h3>
          <p className="text-xs text-[#525B6B] leading-relaxed">
            Turnstiles and gate verification scanners are permanently inactive. All delegated gate staff links have expired automatically.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange("registrations")}
            className="w-full text-xs font-semibold shadow-2xs"
          >
            Access All Registration Records &rarr;
          </Button>

          <Link href="/org/audit-logs" className="block pt-1">
            <Button variant="ghost" size="sm" className="w-full text-xs text-[#525B6B]">
              View Organization Audit Trail
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
