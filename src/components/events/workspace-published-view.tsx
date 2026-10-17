"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  KeyRound,
  Copy,
  ExternalLink,
  CreditCard,
  ArrowRight,
  Plus,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface WorkspacePublishedViewProps {
  event: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    date_end?: string | null;
    location?: string | null;
    payment_config?: any;
  };
  metrics: {
    registrationsCount: number;
    ticketsCount: number;
    checkedInCount: number;
    pendingPaymentsCount: number;
  };
  recentRegistrations: Array<{
    id: string;
    participant_name: string;
    email: string;
    status: string;
    created_at: string;
    payment_status?: string | null;
    transaction_id?: string | null;
  }>;
  verifiersCount: number;
  onStartEventClick: () => void;
  onReviewPaymentClick: (reg: any) => void;
  onCopyLink: () => void;
  onTabChange: (tab: "overview" | "registrations" | "tickets" | "payments" | "verifiers") => void;
  onInviteVerifierClick: () => void;
  copiedLink: boolean;
  isStartingEvent?: boolean;
  formFieldsCount?: number;
}

export function WorkspacePublishedView({
  event,
  metrics,
  recentRegistrations,
  verifiersCount,
  onReviewPaymentClick,
  onCopyLink,
  onTabChange,
  onInviteVerifierClick,
  copiedLink,
  formFieldsCount = 0,
}: WorkspacePublishedViewProps) {
  const isPaid = event.event_type === "PAID";

  // Pending payment registrations (only relevant for paid events)
  const pendingPaymentRegistrations = isPaid
    ? recentRegistrations.filter(
        (r) => r.payment_status === "SUBMITTED" || r.payment_status === "PENDING"
      )
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ========================================================================= */}
      {/* MAIN COLUMN (8 COLS): PAYMENTS (IF PENDING) -> RECENT REGISTRATIONS -> DETAILS */}
      {/* ========================================================================= */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Pending Payment Claims (Paid Events Only with Pending Submissions) */}
        {isPaid && pendingPaymentRegistrations.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-700" />
                <h3 className="text-xs font-bold text-amber-900">
                  Payment Claims Awaiting Review ({pendingPaymentRegistrations.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onTabChange("payments")}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <span>View all in Payments tab</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-amber-200/60 rounded-xl border border-amber-200 bg-white overflow-hidden text-xs">
              {pendingPaymentRegistrations.slice(0, 3).map((reg) => (
                <div
                  key={reg.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">
                      {reg.participant_name}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">
                      {reg.email} {reg.transaction_id ? `· TX: ${reg.transaction_id}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onReviewPaymentClick(reg)}
                    className="text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Review Claim
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Recent Registrations Section */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-900">
                Recent Attendee Registrations
              </h3>
              <span className="text-xs text-zinc-500 font-medium ml-1">
                ({metrics.registrationsCount})
              </span>
            </div>

            {recentRegistrations.length > 0 && (
              <button
                type="button"
                onClick={() => onTabChange("registrations")}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {recentRegistrations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-900">
                  No registrations yet
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-0.5">
                  Share your public registration link to begin accepting attendee signups.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
                  onClick={onCopyLink}
                >
                  <Copy className="h-3 w-3 text-zinc-500" />
                  <span>{copiedLink ? "Link Copied!" : "Copy Registration Link"}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60 text-zinc-500 font-semibold">
                    <th className="py-2.5 px-4">Attendee</th>
                    <th className="py-2.5 px-4">Registration Status</th>
                    {isPaid && <th className="py-2.5 px-4">Payment</th>}
                    <th className="py-2.5 px-4 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-900">
                  {recentRegistrations.slice(0, 5).map((reg) => (
                    <tr key={reg.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-zinc-900">{reg.participant_name}</p>
                        <p className="text-[11px] text-zinc-500">{reg.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={reg.status} />
                      </td>
                      {isPaid && (
                        <td className="py-3 px-4">
                          <StatusBadge status={reg.payment_status || "PENDING"} />
                        </td>
                      )}
                      <td className="py-3 px-4 text-right text-xs text-zinc-500">
                        {format(new Date(reg.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Event Details Section */}
        <div
          data-tour="event-parameters"
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              Event Schedule & Venue Details
            </h3>
            <Link href={`/org/events/${event.id}/edit`}>
              <Button variant="outline" size="sm" className="text-xs font-medium shadow-2xs cursor-pointer">
                Edit Details
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1">
              <span className="text-zinc-500 font-medium block">Date & Time</span>
              <p className="font-semibold text-zinc-900">
                {event.date_start
                  ? format(new Date(event.date_start), "EEEE, MMMM d, yyyy · h:mm a")
                  : "Date not specified"}
                {event.date_end ? ` – ${format(new Date(event.date_end), "h:mm a")}` : ""}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-1">
              <span className="text-zinc-500 font-medium block">Venue Location</span>
              <p className="font-semibold text-zinc-900 truncate">
                {event.location || "Location not specified"}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="pt-2 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100">
              <span className="text-zinc-400 font-medium block mb-1">Description</span>
              <p>{event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY COLUMN (4 COLS): PUBLIC LINK -> FORM SUMMARY -> GATE STAFF */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 space-y-5">
        {/* Public Event Link Hub */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-900">
              Public Event Link
            </h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Share this link across social media, email, or tickets for attendee registration.
          </p>

          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-zinc-700 truncate font-medium">
              /events/{event.slug}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyLink}
              className="text-xs h-7 px-2 shrink-0 shadow-2xs cursor-pointer"
            >
              <Copy className="h-3 w-3 mr-1" />
              <span>{copiedLink ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          <Link href={`/events/${event.slug}`} target="_blank" className="block pt-1">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium shadow-2xs gap-1.5 cursor-pointer">
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
              <span>Preview Public Page</span>
            </Button>
          </Link>
        </div>

        {/* Registration Form Summary */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-900">
                Registration Form
              </h3>
            </div>
            <Link
              href={`/org/events/${event.id}/form`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Edit Form &rarr;
            </Link>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            {formFieldsCount > 0
              ? `${formFieldsCount} attendee questions configured on public form.`
              : "Default attendee contact fields configured."}
          </p>

          <Link href={`/org/events/${event.id}/form`} className="block">
            <Button variant="outline" size="sm" className="w-full text-xs font-medium shadow-2xs cursor-pointer">
              Open Form Builder
            </Button>
          </Link>
        </div>

        {/* Gate Staff Summary */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-zinc-400" />
              <h3 className="text-xs font-semibold text-zinc-900">
                Gate Staff
              </h3>
            </div>
            <button
              type="button"
              onClick={onInviteVerifierClick}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Invite Staff</span>
            </button>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            {verifiersCount > 0
              ? `${verifiersCount} gate verifier account${verifiersCount === 1 ? "" : "s"} ready for entrance scanning.`
              : "No gate staff accounts invited yet. Verifiers receive magic links to scan attendee QR passes."}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange("verifiers")}
            className="w-full text-xs font-medium shadow-2xs cursor-pointer"
          >
            Manage Gate Staff &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
