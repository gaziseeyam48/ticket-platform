"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Ban,
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface WorkspaceCancelledViewProps {
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
  };
  registrations: Array<{
    id: string;
    participant_name: string;
    email: string;
    status: string;
    created_at: string;
    payment_status?: string | null;
  }>;
  onTabChange: (tab: "overview" | "registrations" | "tickets" | "payments" | "verifiers") => void;
}

export function WorkspaceCancelledView({
  event,
  metrics,
  registrations,
  onTabChange,
}: WorkspaceCancelledViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. Prominent Cancellation Advisory Banner */}
      <div className="rounded-2xl border border-[#FECDD3] bg-gradient-to-r from-[#FFF1F2] via-white to-white p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5 text-[#9F1239]">
          <div className="w-8 h-8 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center">
            <Ban className="h-5 w-5 text-[#C2415D]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#881337]">
              Event Cancelled — Operations Terminated
            </h3>
            <p className="text-xs text-[#9F1239] mt-0.5">
              This event has reached a terminal cancelled state and cannot be reactivated or restarted.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#525B6B] leading-relaxed pl-10">
          Public registration at <code className="font-mono text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded">/events/{event.slug}</code> is taken offline. All previously issued digital entrance tickets are permanently voided and turnstile scanners will reject any check-in attempts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Left: Historical Pre-Cancellation Submissions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-[#DCE1E8] bg-white overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-[#DCE1E8] bg-[#F1F4F8]/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#525B6B]" />
                <h3 className="text-xs font-semibold text-[#171923]">
                  Submissions Recorded Prior to Cancellation
                </h3>
                <span className="text-xs text-[#525B6B] bg-white border border-[#DCE1E8] px-2 py-0.5 rounded-full font-medium">
                  {registrations.length}
                </span>
              </div>

              {registrations.length > 0 && (
                <button
                  type="button"
                  onClick={() => onTabChange("registrations")}
                  className="text-xs font-semibold text-[#1D4ED8] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Registrations</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {registrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667085]">
                No attendee registrations were received prior to cancellation.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] font-semibold">
                      <th className="py-2.5 px-4">Attendee</th>
                      <th className="py-2.5 px-4">Registration Status</th>
                      <th className="py-2.5 px-4">Date Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                    {registrations.slice(0, 6).map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#F7F8FA] transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#171923]">{reg.participant_name}</p>
                          <p className="text-xs text-[#667085]">{reg.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status="CANCELLED" />
                        </td>
                        <td className="py-3 px-4 text-xs text-[#525B6B]">
                          {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Archived Event Parameters */}
          <div
            data-tour="event-parameters"
            className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-3"
          >
            <h3 className="text-xs font-semibold text-[#171923]">
              Archived Event Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
                <span className="text-[#525B6B]">Originally Scheduled:</span>
                <p className="font-semibold text-[#171923] mt-0.5">
                  {event.date_start ? format(new Date(event.date_start), "EEEE, MMM d, yyyy") : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
                <span className="text-[#525B6B]">Location:</span>
                <p className="font-semibold text-[#171923] mt-0.5 truncate">
                  {event.location || "Location not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Terminal Record Audit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold text-[#171923] flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-[#C2415D]" />
              Audit Trail & Records
            </h3>
            <p className="text-xs text-[#525B6B] leading-relaxed">
              Cancellation is logged in the permanent organization audit ledger with the timestamp and acting administrator.
            </p>
            <Link href="/org/audit-logs" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                View Organization Audit Log &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
