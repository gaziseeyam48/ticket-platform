"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  QrCode,
  CheckCircle2,
  Users,
  Ticket,
  Clock,
  KeyRound,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils/cn";

interface WorkspaceLiveViewProps {
  event: {
    id: string;
    name: string;
    slug: string;
    status: string;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    location?: string | null;
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
  verifiersList: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    last_accessed_at?: string | null;
  }>;
  onEndEventClick: () => void;
  onInviteVerifierClick: () => void;
  onTabChange: (tab: "overview" | "registrations" | "tickets" | "payments" | "verifiers") => void;
}

export function WorkspaceLiveView({
  event,
  metrics,
  tickets,
  verifiersList,
  onEndEventClick,
  onInviteVerifierClick,
  onTabChange,
}: WorkspaceLiveViewProps) {
  const checkinPercentage =
    metrics.ticketsCount > 0
      ? ((metrics.checkedInCount / metrics.ticketsCount) * 100).toFixed(1)
      : "0.0";

  const remainingAttendees = Math.max(0, metrics.ticketsCount - metrics.checkedInCount);

  // Tickets that are checked in, sorted by most recent check-in time
  const checkedInTickets = tickets
    .filter((t) => t.status === "CHECKED_IN" && t.checked_in_at)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ========================================================================= */}
      {/* MAIN LEFT WORKSPACE (8 COLS): TURNSTILE OPERATIONS CENTER & LIVE FEED */}
      {/* ========================================================================= */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Live Turnstile Operations Center (Hero Card) */}
        <div className="rounded-2xl border border-[#A3E6CD] bg-gradient-to-br from-[#E6F7F0] via-white to-white p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A3E6CD]/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#087F5B] animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-[#171923]">
                  Live Turnstile Operations Center
                </h3>
              </div>
              <p className="text-xs text-[#525B6B] leading-relaxed">
                Entrance gates are active. Scan attendee QR passes using your device camera or dedicated scanner.
              </p>
            </div>

            {/* Dominant Primary Action: Open Gate Scanner */}
            <Link href={`/verify?event_id=${event.id}`}>
              <Button
                variant="positive"
                size="lg"
                className="text-xs sm:text-sm font-semibold gap-2 shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
              >
                <QrCode className="h-4 w-4" />
                <span>Open Gate Scanner</span>
              </Button>
            </Link>
          </div>

          {/* Turnstile Admittance Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#171923]">
                Admittance Progress: {metrics.checkedInCount} of {metrics.ticketsCount} Admitted
              </span>
              <span className="font-bold text-[#06694A] font-mono">
                {checkinPercentage}% Check-in Rate
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#E9EDF2] overflow-hidden">
              <div
                className="h-full bg-[#087F5B] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, parseFloat(checkinPercentage))}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#667085] pt-1">
              <span>{metrics.checkedInCount} verified at entrance</span>
              <span>{remainingAttendees} awaiting arrival</span>
            </div>
          </div>
        </div>

        {/* 2. Live Entrance Activity Feed */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[#DCE1E8] bg-[#F1F4F8]/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#087F5B]" />
              <h3 className="text-xs font-semibold text-[#171923]">
                Recent Turnstile Check-Ins
              </h3>
              <span className="text-xs text-[#06694A] bg-[#E6F7F0] border border-[#A3E6CD] px-2 py-0.5 rounded-full font-semibold">
                {checkedInTickets.length} Admitted
              </span>
            </div>

            {checkedInTickets.length > 0 && (
              <button
                type="button"
                onClick={() => onTabChange("tickets")}
                className="text-xs font-semibold text-[#1D4ED8] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All Tickets</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {checkedInTickets.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-[#E6F7F0] flex items-center justify-center text-[#087F5B]">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#171923]">
                  Waiting for first entrance check-in
                </h4>
                <p className="text-xs text-[#525B6B] max-w-sm mx-auto mt-1 leading-relaxed">
                  Attendees will appear here in real time as their passes are scanned at the entrance turnstiles.
                </p>
              </div>
              <Link href={`/verify?event_id=${event.id}`}>
                <Button variant="positive" size="sm" className="text-xs font-semibold gap-1.5 shadow-xs">
                  <QrCode className="h-3.5 w-3.5" />
                  Launch Gate Scanner
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] font-semibold">
                    <th className="py-2.5 px-4">Attendee</th>
                    <th className="py-2.5 px-4">Pass Number</th>
                    <th className="py-2.5 px-4">Turnstile Status</th>
                    <th className="py-2.5 px-4">Check-in Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                  {checkedInTickets.slice(0, 8).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#171923]">{ticket.participant_name}</p>
                        <p className="text-xs text-[#667085]">{ticket.participant_email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#171923]">
                        #{ticket.ticket_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F7F0] text-[#06694A] border border-[#A3E6CD]">
                          <CheckCircle2 className="h-3 w-3" />
                          Admitted
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-[#171923]">
                        {ticket.checked_in_at
                          ? format(new Date(ticket.checked_in_at), "h:mm:ss a · MMM d")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Event Parameters Reference Card */}
        <div
          data-tour="event-parameters"
          className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F4F8]">
            <h3 className="text-xs font-semibold text-[#171923]">
              Operational Schedule & Venue Reference
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
              <span className="text-[#525B6B]">Date & Time:</span>
              <p className="font-semibold text-[#171923] mt-0.5">
                {event.date_start ? format(new Date(event.date_start), "EEEE, MMM d, yyyy · h:mm a") : "—"}
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
      {/* RIGHT SIDEBAR (4 COLS): GATE STAFF ON DUTY & END EVENT CONTROL */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 space-y-6">
        {/* On-Duty Gate Staff Card */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[#087F5B]" />
              <h3 className="text-xs font-semibold text-[#171923]">
                Gate Staff On Duty
              </h3>
            </div>
            <button
              type="button"
              onClick={onInviteVerifierClick}
              className="text-xs font-semibold text-[#087F5B] hover:text-[#06694A] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Invite Staff</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {verifiersList.length === 0 ? (
              <p className="text-xs text-[#525B6B] italic">
                No dedicated gate staff assigned. Organizers can still scan tickets directly.
              </p>
            ) : (
              <div className="space-y-2">
                {verifiersList.slice(0, 4).map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#171923] truncate">{v.name}</p>
                      <p className="text-[10px] text-[#667085] truncate font-mono">{v.email}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[#06694A] bg-[#E6F7F0] px-2 py-0.5 rounded-full border border-[#A3E6CD] shrink-0">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange("verifiers")}
            className="w-full text-xs font-medium shadow-2xs"
          >
            Manage Staff & Scanner Links &rarr;
          </Button>
        </div>

        {/* End Event & Close Gates Control (Secondary Placement) */}
        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFDF7] p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#78350F]">
            <Clock className="h-4 w-4" />
            <h3 className="text-xs font-bold">Conclude Event Operations</h3>
          </div>
          <p className="text-xs text-[#92400E] leading-relaxed">
            When your event has concluded, close entrance gates to expire scanner links and finalize attendance turnout.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={onEndEventClick}
            className="w-full text-xs font-semibold text-[#78350F] hover:bg-[#FFFBEB] border-[#FDE68A] shadow-2xs cursor-pointer"
          >
            End Event & Close Gates
          </Button>
        </div>
      </div>
    </div>
  );
}
