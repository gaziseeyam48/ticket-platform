"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  FileText,
  Users,
  Ticket,
  CheckCircle2,
  Clock,
  FileEdit,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Plus,
  Mail,
  Search,
  Filter,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Radio,
  Eye,
  AlertTriangle,
  KeyRound,
  UserCheck,
  RefreshCw,
  Ban,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { EventLifecyclePanel } from "@/components/events/event-lifecycle-panel";
import { IssueTicketModal } from "@/components/events/issue-ticket-modal";
import { InviteVerifierModal } from "@/components/events/invite-verifier-modal";
import { resendTicketEmail, revokeTicket } from "@/app/actions/ticket.actions";
import { reviewRegistrationPayment } from "@/app/actions/registration.actions";
import { resendVerifierInvite, revokeVerifier } from "@/app/actions/verifier.actions";
import { startEvent, endEvent } from "@/app/actions/event.actions";
import { cn } from "@/lib/utils/cn";

export interface EventWorkspaceProps {
  event: {
    id: string;
    organization_id: string;
    name: string;
    slug: string;
    description?: string | null;
    event_type: "FREE" | "PAID";
    date_start?: string | null;
    date_end?: string | null;
    location?: string | null;
    status: string;
    payment_config?: any;
    created_at?: string;
  };
  form: {
    id: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
      placeholder?: string;
    }>;
  } | null;
  metrics: {
    registrationsCount: number;
    ticketsCount: number;
    checkedInCount: number;
    pendingPaymentsCount: number;
  };
  initialRegistrations: Array<{
    id: string;
    participant_name: string;
    email: string;
    status: string;
    created_at: string;
    form_data?: any;
    payment_status?: string | null;
    transaction_id?: string | null;
  }>;
  initialTickets: Array<{
    id: string;
    ticket_number: string;
    status: string;
    participant_name: string;
    participant_email: string;
    issued_at: string;
    checked_in_at?: string | null;
    revoked_at?: string | null;
  }>;
  initialVerifiers?: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    expires_at: string;
    last_accessed_at?: string | null;
    created_at: string;
  }>;
}

export function EventWorkspace({
  event,
  form,
  metrics,
  initialRegistrations,
  initialTickets,
  initialVerifiers = [],
}: EventWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active tab state
  const activeTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "tickets" | "payments" | "verifiers">(
    ["overview", "registrations", "tickets", "payments", "verifiers"].includes(activeTabParam)
      ? (activeTabParam as any)
      : "overview"
  );

  // Copy feedback state
  const [copiedLink, setCopiedLink] = useState(false);

  // Toast banner state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Issue Ticket Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // End Event Confirmation Modal
  const [isEndEventModalOpen, setIsEndEventModalOpen] = useState(false);
  const [isStartingEvent, setIsStartingEvent] = useState(false);

  // Verifier State & Modal
  const [isInviteVerifierModalOpen, setIsInviteVerifierModalOpen] = useState(false);
  const [verifiersList, setVerifiersList] = useState(initialVerifiers);
  const [resendingVerifierId, setResendingVerifierId] = useState<string | null>(null);
  const [revokingVerifierId, setRevokingVerifierId] = useState<string | null>(null);
  const [verifierSearch, setVerifierSearch] = useState("");

  // Payment Review Modal
  const [reviewingPayment, setReviewingPayment] = useState<any | null>(null);
  const [isReviewingLoading, setIsReviewingLoading] = useState(false);

  // Resend Email loading state
  const [resendingTicketId, setResendingTicketId] = useState<string | null>(null);

  // Participant & Ticket Management state (Phase 13)
  const [ticketsList, setTicketsList] = useState(initialTickets);
  const [revokingTicket, setRevokingTicket] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevokingTicketLoading, setIsRevokingTicketLoading] = useState(false);
  const [inspectingRegistration, setInspectingRegistration] = useState<any | null>(null);
  const [inspectingTicket, setInspectingTicket] = useState<any | null>(null);

  // Search/Filter state for tabs
  const [regSearch, setRegSearch] = useState("");
  const [regFilter, setRegFilter] = useState<string>("ALL");
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState<string>("ALL");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  // Handler for tab switch
  const handleTabChange = (tab: "overview" | "registrations" | "tickets" | "payments" | "verifiers") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Quick Start Event action
  const handleQuickStartEvent = async () => {
    setIsStartingEvent(true);
    try {
      await startEvent(event.id);
      showToast("Event is now LIVE! Entrance gates & QR verification scanners are active.");
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to start event", "error");
    } finally {
      setIsStartingEvent(false);
    }
  };

  // Quick End Event action
  const handleQuickEndEvent = async () => {
    try {
      await endEvent(event.id);
      setIsEndEventModalOpen(false);
      showToast("Event has ended. Entrance gates and check-ins are now closed.");
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to end event", "error");
    }
  };

  // Resend Verifier Invite
  const handleResendVerifier = async (verifierId: string, email: string) => {
    setResendingVerifierId(verifierId);
    try {
      const res = await resendVerifierInvite(verifierId);
      if (res.magicLink) {
        navigator.clipboard.writeText(res.magicLink);
        showToast(`Fresh magic link copied & dispatched to ${email}!`);
      } else {
        showToast(`Invitation resent to ${email}!`);
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to resend invitation", "error");
    } finally {
      setResendingVerifierId(null);
    }
  };

  // Revoke Verifier Access
  const handleRevokeVerifier = async (verifierId: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke entrance scanner access for ${name}?`)) {
      return;
    }
    setRevokingVerifierId(verifierId);
    try {
      await revokeVerifier(verifierId);
      setVerifiersList((prev) =>
        prev.map((v) => (v.id === verifierId ? { ...v, status: "REVOKED" } : v))
      );
      showToast(`Revoked gate scanner access for ${name}`);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to revoke verifier", "error");
    } finally {
      setRevokingVerifierId(null);
    }
  };

  // Copy public event link
  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/events/${event.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast("Registration link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Resend Ticket Email
  const handleResendTicket = async (ticketId: string, email: string) => {
    setResendingTicketId(ticketId);
    try {
      await resendTicketEmail(ticketId);
      showToast(`Pass confirmation re-sent to ${email}`);
    } catch (err: any) {
      showToast(err.message || "Failed to resend pass email", "error");
    } finally {
      setResendingTicketId(null);
    }
  };

  // Revoke Entrance Ticket
  const handleRevokeTicketConfirm = async () => {
    if (!revokingTicket) return;
    setIsRevokingTicketLoading(true);
    try {
      await revokeTicket(revokingTicket.id, revokeReason.trim() || undefined);
      const now = new Date().toISOString();
      setTicketsList((prev) =>
        prev.map((t) =>
          t.id === revokingTicket.id
            ? { ...t, status: "REVOKED", revoked_at: now }
            : t
        )
      );
      if (inspectingTicket && inspectingTicket.id === revokingTicket.id) {
        setInspectingTicket((prev: any) => ({
          ...prev,
          status: "REVOKED",
          revoked_at: now,
        }));
      }
      showToast(`Pass #${revokingTicket.ticket_number} has been revoked.`);
      setRevokingTicket(null);
      setRevokeReason("");
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to revoke ticket", "error");
    } finally {
      setIsRevokingTicketLoading(false);
    }
  };

  // Review Payment
  const handleReviewPaymentAction = async (action: "APPROVE" | "REJECT") => {
    if (!reviewingPayment) return;
    setIsReviewingLoading(true);
    try {
      await reviewRegistrationPayment(reviewingPayment.id, action);
      showToast(
        action === "APPROVE"
          ? `Payment approved! Entrance pass issued to ${reviewingPayment.participant_name}.`
          : `Payment marked as rejected.`
      );
      setReviewingPayment(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to review payment", "error");
    } finally {
      setIsReviewingLoading(false);
    }
  };

  const isPaid = event.event_type === "PAID";
  const fields = form?.fields || [];
  const hasFormFields = fields.length > 0;

  // Filtered registrations
  const filteredRegistrations = initialRegistrations.filter((reg) => {
    const matchesSearch =
      !regSearch.trim() ||
      reg.participant_name?.toLowerCase().includes(regSearch.toLowerCase()) ||
      reg.email?.toLowerCase().includes(regSearch.toLowerCase()) ||
      reg.transaction_id?.toLowerCase().includes(regSearch.toLowerCase());

    const matchesStatus =
      regFilter === "ALL" ||
      (regFilter === "CONFIRMED" && (reg.status === "REGISTERED" || reg.status === "CONFIRMED")) ||
      (regFilter === "PENDING" && (reg.status === "PENDING" || reg.payment_status === "PENDING" || reg.payment_status === "SUBMITTED")) ||
      (regFilter === "CANCELLED" && reg.status === "CANCELLED");

    return matchesSearch && matchesStatus;
  });

  // Filtered tickets
  const filteredTickets = ticketsList.filter((t) => {
    const matchesSearch =
      !ticketSearch.trim() ||
      t.ticket_number?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.participant_name?.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.participant_email?.toLowerCase().includes(ticketSearch.toLowerCase());

    const matchesFilter =
      ticketFilter === "ALL" ||
      (ticketFilter === "CHECKED_IN" && t.status === "CHECKED_IN") ||
      (ticketFilter === "ISSUED" && t.status === "ISSUED") ||
      (ticketFilter === "REVOKED" && t.status === "REVOKED");

    return matchesSearch && matchesFilter;
  });

  // Payment registrations
  const rawPaymentRegistrations = initialRegistrations.filter(
    (reg) => reg.payment_status || reg.transaction_id
  );

  const paymentRegistrations = rawPaymentRegistrations.filter((reg) => {
    const matchesSearch =
      !paymentSearch.trim() ||
      reg.participant_name?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      reg.email?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      reg.transaction_id?.toLowerCase().includes(paymentSearch.toLowerCase());

    const status = reg.payment_status || "PENDING";
    const matchesFilter =
      paymentFilter === "ALL" || paymentFilter === status;

    return matchesSearch && matchesFilter;
  });

  const paymentStats = {
    total: rawPaymentRegistrations.length,
    submitted: rawPaymentRegistrations.filter((r) => r.payment_status === "SUBMITTED").length,
    pending: rawPaymentRegistrations.filter((r) => r.payment_status === "PENDING" || !r.payment_status).length,
    approved: rawPaymentRegistrations.filter((r) => r.payment_status === "APPROVED").length,
    rejected: rawPaymentRegistrations.filter((r) => r.payment_status === "REJECTED").length,
  };

  // Checkin percentage
  const checkinPercentage =
    metrics.ticketsCount > 0
      ? ((metrics.checkedInCount / metrics.ticketsCount) * 100).toFixed(1)
      : "0";

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2",
            toastMessage.type === "success"
              ? "bg-zinc-900 text-white border-zinc-800"
              : "bg-red-600 text-white border-red-700"
          )}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-white shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Subtle Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link
          href="/org/events"
          className="hover:text-zinc-900 transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3 w-3" />
          Events
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="font-semibold text-zinc-800 truncate max-w-xs">{event.name}</span>
      </nav>

      {/* 2. Cohesive Event Header */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Event Identity */}
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                {event.name}
              </h1>
              <StatusBadge status={event.status} />
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                {isPaid ? "Paid Pass" : "Free Admission"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 font-medium">
              {(event.date_start || event.date_end) && (
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  {event.date_start &&
                    format(new Date(event.date_start), "EEEE, MMMM d, yyyy · h:mm a")}
                  {event.date_end && ` – ${format(new Date(event.date_end), "h:mm a")}`}
                </span>
              )}

              {event.location && (
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {event.location}
                </span>
              )}

              <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-200/70">
                <span className="font-mono text-zinc-600 font-medium">/{event.slug}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-0.5 text-zinc-400 hover:text-zinc-800 transition-colors rounded"
                  title="Copy registration link"
                  aria-label="Copy link"
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: State-Dependent Action Hierarchy */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
            {/* Primary Action Based on Event Lifecycle State */}
            {event.status === "LIVE" && (
              <div className="flex items-center gap-2">
                <Link href={`/verify?event_id=${event.id}`}>
                  <Button
                    size="sm"
                    className="text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Open Gate Scanner
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200/80 shadow-2xs cursor-pointer"
                  onClick={() => setIsEndEventModalOpen(true)}
                >
                  End Event
                </Button>
              </div>
            )}

            {event.status === "PUBLISHED" && (
              <Button
                size="sm"
                className="text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                onClick={handleQuickStartEvent}
                disabled={isStartingEvent}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isStartingEvent ? "Starting Event..." : "Start Event (Go Live)"}
              </Button>
            )}

            {event.status === "DRAFT" && (
              <Link href={`/org/events/${event.id}/form`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-300" />
                  Configure Form to Publish
                </Button>
              </Link>
            )}

            {event.status === "ENDED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-600 border border-zinc-200">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                Event Concluded (Gates Closed)
              </span>
            )}

            {/* Secondary Actions */}
            <Link href={`/org/events/${event.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 shadow-2xs"
              >
                <FileEdit className="h-3.5 w-3.5 text-zinc-400" />
                Edit Event
              </Button>
            </Link>

            {(event.status === "PUBLISHED" || event.status === "LIVE") && (
              <Link href={`/events/${event.slug}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  Public Page
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-xs font-medium gap-1.5 shadow-2xs"
              onClick={() => setIsIssueModalOpen(true)}
            >
              <Ticket className="h-3.5 w-3.5 text-zinc-400" />
              Issue Pass
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Event Key Metrics Row */}
      <div
        className={cn(
          "grid gap-4",
          isPaid
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        <MetricCard
          label="Registrations"
          value={metrics.registrationsCount}
          icon={Users}
          iconColorClass="text-sky-700"
          iconBgClass="bg-sky-50"
          trendText={
            metrics.registrationsCount > 0
              ? `${metrics.registrationsCount} attendees`
              : "No submissions"
          }
          trendType="neutral"
          subtext={
            isPaid && metrics.pendingPaymentsCount > 0
              ? `${metrics.pendingPaymentsCount} awaiting payment review`
              : "Attendee submissions received via registration form"
          }
        />

        <MetricCard
          label="Tickets Issued"
          value={metrics.ticketsCount}
          icon={Ticket}
          iconColorClass="text-emerald-700"
          iconBgClass="bg-emerald-50"
          trendText={metrics.ticketsCount > 0 ? "Generated" : "None issued"}
          trendType={metrics.ticketsCount > 0 ? "positive" : "neutral"}
          subtext="Digital entrance passes created for confirmed attendees"
        />

        <MetricCard
          label="Successful Check-ins"
          value={metrics.checkedInCount}
          icon={CheckCircle2}
          iconColorClass="text-indigo-700"
          iconBgClass="bg-indigo-50"
          trendText={
            metrics.ticketsCount > 0
              ? `${checkinPercentage}% of issued passes`
              : "0% check-in"
          }
          trendType="neutral"
          subtext="Attendees admitted through gate verification scanners"
        />

        {/* 4th Card: Only displayed for Paid Events */}
        {isPaid && (
          <MetricCard
            label="Pending Payments"
            value={metrics.pendingPaymentsCount}
            icon={CreditCard}
            iconColorClass={
              metrics.pendingPaymentsCount > 0 ? "text-amber-700" : "text-zinc-600"
            }
            iconBgClass={
              metrics.pendingPaymentsCount > 0 ? "bg-amber-50" : "bg-zinc-100"
            }
            trendText={
              metrics.pendingPaymentsCount > 0 ? "Needs Review" : "All Reviewed"
            }
            trendType={metrics.pendingPaymentsCount > 0 ? "warning" : "positive"}
            subtext="Submissions awaiting transaction verification & ticket generation"
          />
        )}
      </div>

      {/* 4. Event-Scoped Navigation Bar */}
      <div className="border-b border-zinc-200/80">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto" aria-label="Event Tabs">
          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "overview"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Overview
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("registrations")}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "registrations"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Registrations
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                activeTab === "registrations"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              {metrics.registrationsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("tickets")}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "tickets"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <Ticket className="h-3.5 w-3.5" />
            Tickets
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                activeTab === "tickets"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              {metrics.ticketsCount}
            </span>
          </button>

          {isPaid && (
            <button
              type="button"
              onClick={() => handleTabChange("payments")}
              className={cn(
                "px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2",
                activeTab === "payments"
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
              )}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Payments
              {metrics.pendingPaymentsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {metrics.pendingPaymentsCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabChange("verifiers")}
            className={cn(
              "px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "verifiers"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Gate Staff
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                activeTab === "verifiers"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              {verifiersList.length}
            </span>
          </button>
        </nav>
      </div>

      {/* 5. Workspace Tab Views */}
      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Event Information & Operational Parameters */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Event Parameters & Schedule
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">
                    ID: {event.id.slice(0, 8)}...
                  </span>
                </div>
                <Link href={`/org/events/${event.id}/edit`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-medium gap-1 shadow-2xs"
                  >
                    <FileEdit className="h-3 w-3 text-zinc-500" />
                    Edit Details
                  </Button>
                </Link>
              </div>

              {/* Structured Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Schedule */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70">
                  <p className="text-xs text-zinc-500 font-medium">Scheduled Schedule</p>
                  <p className="text-sm font-semibold text-zinc-900 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    {event.date_start ? (
                      <>
                        {format(new Date(event.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                        {event.date_end && ` – ${format(new Date(event.date_end), "h:mm a")}`}
                      </>
                    ) : (
                      <span className="text-zinc-400 font-normal">Date not specified</span>
                    )}
                  </p>
                </div>

                {/* Location */}
                <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70">
                  <p className="text-xs text-zinc-500 font-medium">Venue & Location</p>
                  <p className="text-sm font-semibold text-zinc-900 mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {event.location || (
                        <span className="text-zinc-400 font-normal">Location not specified</span>
                      )}
                    </span>
                  </p>
                </div>

                {/* Admission Model */}
                <div className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70">
                  <p className="text-xs text-zinc-500 font-medium">Admission Model</p>
                  <p className="text-sm font-semibold text-zinc-900 mt-1 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>{isPaid ? "Paid Pass" : "Free Admission"}</span>
                  </p>
                </div>

                {/* Public Link */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">Public Event Slug</p>
                    <p className="text-sm font-mono font-semibold text-zinc-800 mt-0.5">
                      /{event.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium gap-1 shadow-2xs"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-3 w-3 text-zinc-400" />
                      Copy Link
                    </Button>
                    {(event.status === "PUBLISHED" || event.status === "LIVE") && (
                      <Link href={`/events/${event.slug}`} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-medium gap-1 shadow-2xs"
                        >
                          <ExternalLink className="h-3 w-3 text-zinc-400" />
                          View Page
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              {event.description && (
                <div className="pt-3 border-t border-zinc-100 text-xs space-y-1.5">
                  <p className="text-xs text-zinc-500 font-medium">Description</p>
                  <div className="p-3.5 rounded-xl bg-zinc-50/40 border border-zinc-200/60 text-zinc-700 whitespace-pre-wrap leading-relaxed text-xs">
                    {event.description}
                  </div>
                </div>
              )}
            </div>

            {/* Payment & Settlement Parameters (Paid Events Only) */}
            {isPaid && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Payment & Settlement Parameters
                    </h2>
                  </div>
                  <Link href={`/org/events/${event.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium gap-1 shadow-2xs"
                    >
                      <FileEdit className="h-3 w-3 text-zinc-500" />
                      Edit Banking Details
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/70">
                    <p className="text-zinc-400 font-mono uppercase text-[10px] font-semibold">Payment Channel</p>
                    <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                      {event.payment_config?.payment_method || "Direct Transfer"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/70">
                    <p className="text-zinc-400 font-mono uppercase text-[10px] font-semibold">Price per Pass</p>
                    <p className="text-sm font-bold text-zinc-900 mt-0.5">
                      {event.payment_config?.amount || "0"} {event.payment_config?.currency || "USD"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/70">
                    <p className="text-zinc-400 font-mono uppercase text-[10px] font-semibold">Account / Identifier</p>
                    <p className="text-sm font-mono font-semibold text-zinc-900 mt-0.5">
                      {event.payment_config?.account_number || "—"}
                    </p>
                  </div>
                </div>

                {event.payment_config?.account_name && (
                  <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/70 text-xs">
                    <span className="text-zinc-500 font-medium">Beneficiary / Account Name: </span>
                    <span className="font-semibold text-zinc-800">{event.payment_config.account_name}</span>
                  </div>
                )}

                {event.payment_config?.instructions && (
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                    <span className="font-semibold text-amber-950">Instructions for Attendees: </span>
                    {event.payment_config.instructions}
                  </div>
                )}
              </div>
            )}

            {/* Recent Registrations Preview Table */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/75 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-zinc-900">
                    Recent Registrations
                  </h3>
                  <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full font-medium">
                    {initialRegistrations.length}
                  </span>
                </div>
                {initialRegistrations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleTabChange("registrations")}
                    className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>

              {initialRegistrations.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">
                      No registrations yet
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      Your attendee registrations will appear here once participants submit the public registration form.
                    </p>
                  </div>
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium gap-1.5"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-3 w-3" />
                      Copy Registration Link
                    </Button>
                    {(event.status === "PUBLISHED" || event.status === "LIVE") && (
                      <Link href={`/events/${event.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="text-xs font-medium gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Preview Public Page
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-zinc-600 font-semibold">
                        <th className="py-2.5 px-4">Attendee</th>
                        <th className="py-2.5 px-4">Status</th>
                        {isPaid && <th className="py-2.5 px-4">Payment</th>}
                        <th className="py-2.5 px-4">Date Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {initialRegistrations.slice(0, 5).map((reg) => (
                        <tr key={reg.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-zinc-900">{reg.participant_name}</p>
                            <p className="text-xs text-zinc-400">{reg.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={reg.status} />
                          </td>
                          {isPaid && (
                            <td className="py-3 px-4">
                              <StatusBadge status={reg.payment_status || "PENDING"} />
                            </td>
                          )}
                          <td className="py-3 px-4 text-xs text-zinc-500">
                            {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Lifecycle Governance Panel */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                  Event Lifecycle
                </h3>
              </div>

              <EventLifecyclePanel
                eventId={event.id}
                currentStatus={event.status}
                hasConfiguredForm={hasFormFields}
                formFieldsCount={fields.length}
                onStatusChange={() => {
                  startTransition(() => {
                    router.refresh();
                  });
                }}
              />
            </div>

            {/* 2. Registration Form Summary Card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-zinc-500" />
                    Registration Form
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {fields.length} questions configured
                  </p>
                </div>

                <Link href={`/org/events/${event.id}/form`}>
                  <Button size="sm" variant="outline" className="text-xs font-semibold shadow-2xs">
                    Builder
                  </Button>
                </Link>
              </div>

              {fields.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 space-y-2">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    No form fields configured
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Add questions so attendees can sign up for this event.
                  </p>
                  <Link href={`/org/events/${event.id}/form`} className="block pt-1">
                    <Button size="sm" variant="primary" className="w-full text-xs font-semibold">
                      Configure Form
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {fields.slice(0, 5).map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs"
                    >
                      <span className="font-medium text-zinc-800 truncate">{f.label}</span>
                      {f.required ? (
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase shrink-0 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                          Req
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 shrink-0">Opt</span>
                      )}
                    </div>
                  ))}
                  {fields.length > 5 && (
                    <p className="text-xs text-center text-zinc-400 pt-1">
                      +{fields.length - 5} more questions
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 3. Entrance Verification Quick Hub */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-3">
              <div className="pb-2 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-zinc-500" />
                  Entrance Verification Gate
                </h3>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Scan attendee QR passes at entrance gates to prevent duplicate entry.
              </p>

              <div className="space-y-2">
                <Link href={`/verify?event_id=${event.id}`} className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5 shadow-2xs"
                  >
                    <QrCode className="h-3.5 w-3.5 text-zinc-600" />
                    Launch Scanner for This Event
                  </Button>
                </Link>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    {verifiersList.filter((v) => v.status === "ACTIVE" || v.status === "INVITED").length} gate staff active
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsInviteVerifierModalOpen(true)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Invite Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTRATIONS */}
      {/* ========================================================================= */}
      {activeTab === "registrations" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs overflow-hidden space-y-0">
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                All Event Registrations
              </h3>
              <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full font-medium">
                {initialRegistrations.length}
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={regFilter}
                onChange={(e) => setRegFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-medium focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed / Registered</option>
                <option value="PENDING">Pending Payment</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search attendee or email..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-900">
                {regSearch || regFilter !== "ALL" ? "No matching registrations" : "No registrations received yet"}
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {regSearch || regFilter !== "ALL"
                  ? "Try adjusting your search query or filter selection."
                  : "Share your public event registration link to begin accepting attendee registrations."}
              </p>
              {!regSearch && regFilter === "ALL" && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-semibold gap-1.5"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Registration Link
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-zinc-600 font-semibold">
                    <th className="py-3 px-4">Attendee</th>
                    <th className="py-3 px-4">Registration Status</th>
                    {isPaid && <th className="py-3 px-4">Payment Status</th>}
                    {isPaid && <th className="py-3 px-4">Transaction ID</th>}
                    <th className="py-3 px-4">Registered At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-900">{reg.participant_name}</p>
                        <p className="text-xs text-zinc-400">{reg.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={reg.status} />
                      </td>
                      {isPaid && (
                        <td className="py-3.5 px-4">
                          <StatusBadge status={reg.payment_status || "PENDING"} />
                        </td>
                      )}
                      {isPaid && (
                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-600">
                          {reg.transaction_id || "—"}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-xs text-zinc-500">
                        {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] font-medium h-7 px-2.5 gap-1 text-zinc-700"
                            onClick={() => setInspectingRegistration(reg)}
                          >
                            <Eye className="h-3 w-3 text-zinc-400" />
                            Inspect
                          </Button>
                          {isPaid &&
                            (reg.payment_status === "SUBMITTED" || reg.payment_status === "PENDING") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[11px] font-semibold h-7 px-2.5 bg-amber-50/50 text-amber-800 border-amber-200"
                                onClick={() => setReviewingPayment(reg)}
                              >
                                Review Payment
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TICKETS */}
      {/* ========================================================================= */}
      {activeTab === "tickets" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs overflow-hidden space-y-0">
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                Entrance Passes & Tickets
              </h3>
              <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full font-medium">
                {ticketsList.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter */}
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-medium focus:outline-none"
              >
                <option value="ALL">All Passes</option>
                <option value="ISSUED">Issued</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="REVOKED">Revoked</option>
              </select>

              {/* Search */}
              <div className="relative w-48 sm:w-56">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ticket # or name..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>

              {/* Direct Issue Button */}
              <Button
                variant="primary"
                size="sm"
                className="text-xs font-semibold gap-1.5 shadow-xs"
                onClick={() => setIsIssueModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Issue Manual Pass
              </Button>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Ticket className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-900">
                {ticketSearch || ticketFilter !== "ALL"
                  ? "No matching passes found"
                  : "No passes issued yet"}
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Entrance passes are generated when attendees register or when organizers manually issue them.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold gap-1.5"
                  onClick={() => setIsIssueModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Issue Manual Pass
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-zinc-600 font-semibold">
                    <th className="py-3 px-4">Pass Number</th>
                    <th className="py-3 px-4">Attendee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Issued At</th>
                    <th className="py-3 px-4">Checked In At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">
                        {t.ticket_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-zinc-900">{t.participant_name}</p>
                        <p className="text-xs text-zinc-400">{t.participant_email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-500">
                        {format(new Date(t.issued_at), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-500">
                        {t.checked_in_at ? (
                          <span className="text-emerald-700 font-medium">
                            {format(new Date(t.checked_in_at), "MMM d, h:mm a")}
                          </span>
                        ) : (
                          <span className="text-zinc-400">Not verified</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] font-medium h-7 px-2.5 gap-1 text-zinc-700"
                            onClick={() => setInspectingTicket(t)}
                            title="Inspect Pass"
                          >
                            <Eye className="h-3 w-3 text-zinc-400" />
                            Inspect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[11px] font-medium h-7 px-2.5 gap-1"
                            onClick={() => handleResendTicket(t.id, t.participant_email)}
                            isLoading={resendingTicketId === t.id}
                            title="Resend Entrance Pass Email"
                          >
                            <Mail className="h-3 w-3 text-zinc-400" />
                            Resend
                          </Button>
                          {t.status !== "REVOKED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] font-medium h-7 px-2.5 gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                              onClick={() => setRevokingTicket(t)}
                              title="Revoke Pass"
                            >
                              <Ban className="h-3 w-3 text-rose-500" />
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-[11px] font-medium text-rose-600 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded">
                              Revoked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PAYMENTS (PAID EVENTS ONLY) */}
      {/* ========================================================================= */}
      {isPaid && activeTab === "payments" && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setPaymentFilter("ALL")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                paymentFilter === "ALL"
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "ALL" ? "text-zinc-400" : "text-zinc-400")}>
                Total
              </p>
              <p className="text-lg font-bold mt-0.5">{paymentStats.total}</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter("SUBMITTED")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                paymentFilter === "SUBMITTED"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-200/80 hover:border-amber-300 shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "SUBMITTED" ? "text-amber-100" : "text-amber-600")}>
                Awaiting Verification
              </p>
              <p className="text-lg font-bold mt-0.5">{paymentStats.submitted}</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter("PENDING")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                paymentFilter === "PENDING"
                  ? "bg-zinc-700 text-white border-zinc-700 shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "PENDING" ? "text-zinc-300" : "text-zinc-500")}>
                Pending Submission
              </p>
              <p className="text-lg font-bold mt-0.5">{paymentStats.pending}</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter("APPROVED")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                paymentFilter === "APPROVED"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-200/80 hover:border-emerald-300 shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "APPROVED" ? "text-emerald-100" : "text-emerald-600")}>
                Approved
              </p>
              <p className="text-lg font-bold mt-0.5">{paymentStats.approved}</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter("REJECTED")}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                paymentFilter === "REJECTED"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-200/80 hover:border-rose-300 shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "REJECTED" ? "text-rose-100" : "text-rose-600")}>
                Rejected
              </p>
              <p className="text-lg font-bold mt-0.5">{paymentStats.rejected}</p>
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs overflow-hidden space-y-0">
            {/* Header with Search and Filter */}
            <div className="p-4 sm:p-5 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Payment Submissions & Approvals
                </h3>
                <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full font-medium">
                  {paymentRegistrations.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-800 font-medium focus:outline-none"
                >
                  <option value="ALL">All Payments</option>
                  <option value="SUBMITTED">Awaiting Verification</option>
                  <option value="PENDING">Pending Submission</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <div className="relative w-48 sm:w-56">
                  <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search attendee or TrxID..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {paymentRegistrations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  {paymentSearch || paymentFilter !== "ALL"
                    ? "No matching payment records found"
                    : "No payment submissions yet"}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  When attendees register for this paid pass, their submitted transaction IDs will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-zinc-600 font-semibold">
                      <th className="py-3 px-4">Attendee</th>
                      <th className="py-3 px-4">Transaction ID / Reference</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Date Submitted</th>
                      <th className="py-3 px-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {paymentRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-zinc-900">{reg.participant_name}</p>
                          <p className="text-xs text-zinc-400">{reg.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-900">
                          {reg.transaction_id ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200/80">
                              {reg.transaction_id}
                            </span>
                          ) : (
                            <span className="text-zinc-400 font-normal">Pending submission</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={reg.payment_status || "PENDING"} />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-500">
                          {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {reg.payment_status === "SUBMITTED" || reg.payment_status === "PENDING" ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs font-semibold h-7 px-3"
                              onClick={() => setReviewingPayment(reg)}
                            >
                              Review & Verify
                            </Button>
                          ) : (
                            <span className="text-xs text-zinc-400 font-medium">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GATE STAFF & VERIFIERS */}
      {/* ========================================================================= */}
      {activeTab === "verifiers" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-2xs overflow-hidden space-y-0">
          {/* Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Entrance Gate Staff & Verifiers
                </h3>
                <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2.5 py-0.5 rounded-full font-medium">
                  {verifiersList.length}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Delegate temporary QR ticket verification access via single-click magic links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter staff by name or email..."
                  value={verifierSearch}
                  onChange={(e) => setVerifierSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shrink-0"
                onClick={() => setIsInviteVerifierModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Invite Gate Staff
              </Button>
            </div>
          </div>

          {verifiersList.filter(
            (v) =>
              !verifierSearch.trim() ||
              v.name.toLowerCase().includes(verifierSearch.toLowerCase()) ||
              v.email.toLowerCase().includes(verifierSearch.toLowerCase())
          ).length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">
                  {verifiersList.length === 0 ? "No gate staff invited yet" : "No staff match your search"}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  Invite security personnel or event volunteers to scan attendee entrance passes.
                  They do not need an account or password to verify passes.
                </p>
              </div>
              {verifiersList.length === 0 && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5"
                  onClick={() => setIsInviteVerifierModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Invite First Gate Staff
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/50 text-zinc-600 font-semibold">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Access Status</th>
                    <th className="py-3 px-4">Access Window / Expiry</th>
                    <th className="py-3 px-4">Last Entrance Scan</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {verifiersList
                    .filter(
                      (v) =>
                        !verifierSearch.trim() ||
                        v.name.toLowerCase().includes(verifierSearch.toLowerCase()) ||
                        v.email.toLowerCase().includes(verifierSearch.toLowerCase())
                    )
                    .map((v) => {
                      const isExpired = new Date(v.expires_at) <= new Date();
                      const displayStatus = isExpired && v.status === "ACTIVE" ? "EXPIRED" : v.status;

                      return (
                        <tr key={v.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-zinc-900">{v.name}</p>
                            <p className="text-xs text-zinc-400 font-mono">{v.email}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={displayStatus} />
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-600">
                            <span className="font-medium">
                              {format(new Date(v.expires_at), "MMM d, yyyy h:mm a")}
                            </span>
                            {isExpired && (
                              <span className="block text-[11px] text-rose-500 font-medium">
                                (Window lapsed)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-500">
                            {v.last_accessed_at ? (
                              format(new Date(v.last_accessed_at), "MMM d, yyyy h:mm a")
                            ) : (
                              <span className="text-zinc-400">Never checked in</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {v.status !== "REVOKED" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-2.5 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                                    disabled={resendingVerifierId === v.id}
                                    onClick={() => handleResendVerifier(v.id, v.email)}
                                    title="Resend invitation email & copy fresh magic link"
                                  >
                                    <RefreshCw
                                      className={cn("h-3 w-3 mr-1", resendingVerifierId === v.id && "animate-spin")}
                                    />
                                    {resendingVerifierId === v.id ? "Sending..." : "Resend Link"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                    disabled={revokingVerifierId === v.id}
                                    onClick={() => handleRevokeVerifier(v.id, v.name)}
                                    title="Revoke gate scanner credentials immediately"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              {v.status === "REVOKED" && (
                                <span className="text-[11px] text-rose-500 font-medium italic pr-2">
                                  Access Revoked
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Gate Staff Verifier Modal */}
      <InviteVerifierModal
        isOpen={isInviteVerifierModalOpen}
        onClose={() => setIsInviteVerifierModalOpen(false)}
        eventId={event.id}
        eventName={event.name}
        onSuccess={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      />

      {/* Manual Issue Pass Modal */}
      <IssueTicketModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        eventId={event.id}
        eventName={event.name}
        onSuccess={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      />

      {/* Payment Review Modal */}
      {reviewingPayment && (
        <Modal
          isOpen={!!reviewingPayment}
          onClose={() => setReviewingPayment(null)}
          title="Review Attendee Payment"
          description={`Verify payment details submitted by ${reviewingPayment.participant_name}.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* Event Banking Context */}
            {event.payment_config && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <p className="font-semibold text-amber-950 uppercase text-[10px] tracking-wider">
                  Expected Payment Settlement
                </p>
                <div className="flex justify-between">
                  <span className="text-amber-800">Target Amount:</span>
                  <span className="font-bold text-amber-950">
                    {event.payment_config.amount || "0"} {event.payment_config.currency || "USD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800">Method & Account:</span>
                  <span className="font-medium text-amber-950">
                    {event.payment_config.payment_method} · {event.payment_config.account_number}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Attendee:</span>
                <span className="font-semibold text-zinc-900">
                  {reviewingPayment.participant_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Email:</span>
                <span className="font-mono text-zinc-800">{reviewingPayment.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Transaction ID:</span>
                <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                  {reviewingPayment.transaction_id || "None submitted"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Registration Time:</span>
                <span className="text-zinc-600">
                  {format(new Date(reviewingPayment.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Approving this payment will immediately generate and email an authentic entrance pass to the participant with a unique QR code.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                onClick={() => handleReviewPaymentAction("REJECT")}
                disabled={isReviewingLoading}
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleReviewPaymentAction("APPROVE")}
                isLoading={isReviewingLoading}
              >
                Approve & Issue Pass
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* End Event Warning Modal */}
      <Modal
        isOpen={isEndEventModalOpen}
        onClose={() => setIsEndEventModalOpen(false)}
        title="End Event & Close Entrance Gates?"
        description="Conclude event turnstile operations."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Ending <strong className="text-zinc-900">{event.name}</strong> will immediately close entrance gate
            verification scanners and deactivate delegated verifier links. Attendee records and check-in
            history will be permanently preserved.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEndEventModalOpen(false)}
              className="text-xs font-medium text-zinc-700 border-zinc-200 hover:bg-zinc-100 cursor-pointer"
            >
              Keep Live
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleQuickEndEvent}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-2xs cursor-pointer"
            >
              End Event & Close Gates
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Pass Confirmation Modal (Phase 13 Dangerous Action) */}
      {revokingTicket && (
        <Modal
          isOpen={!!revokingTicket}
          onClose={() => {
            if (!isRevokingTicketLoading) {
              setRevokingTicket(null);
              setRevokeReason("");
            }
          }}
          title="Revoke Entrance Pass?"
          description={`Void pass #${revokingTicket.ticket_number} for ${revokingTicket.participant_name}.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-rose-950">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Dangerous Action: Irreversible Pass Invalidation</span>
              </div>
              <p className="leading-relaxed text-rose-800">
                Revoking this pass will immediately void ticket{" "}
                <strong className="font-mono">#{revokingTicket.ticket_number}</strong>. Turnstile gates and
                gate verifiers will reject this pass if scanned. This action is recorded in the organization audit log.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Ticket Number:</span>
                <span className="font-mono font-semibold text-zinc-900">
                  #{revokingTicket.ticket_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Attendee:</span>
                <span className="font-semibold text-zinc-900">{revokingTicket.participant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="font-mono text-zinc-700">{revokingTicket.participant_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Current Status:</span>
                <StatusBadge status={revokingTicket.status} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">
                Revocation Reason (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Duplicate registration, refund requested, disciplinary action"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRevokingTicket(null);
                  setRevokeReason("");
                }}
                disabled={isRevokingTicketLoading}
                className="text-xs font-medium"
              >
                Keep Pass Active
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRevokeTicketConfirm}
                isLoading={isRevokingTicketLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 h-9 rounded-lg"
              >
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Inspect Registration Details Modal (Phase 13) */}
      {inspectingRegistration && (
        <Modal
          isOpen={!!inspectingRegistration}
          onClose={() => setInspectingRegistration(null)}
          title="Registration Details"
          description={`Full submission inspection for ${inspectingRegistration.participant_name}.`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Attendee Overview Box */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200/70">
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900">
                    {inspectingRegistration.participant_name}
                  </h4>
                  <p className="text-zinc-500 font-mono text-xs">{inspectingRegistration.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inspectingRegistration.status} />
                  {isPaid && inspectingRegistration.payment_status && (
                    <StatusBadge status={inspectingRegistration.payment_status} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500 font-medium">Registered At:</span>
                  <p className="font-semibold text-zinc-800">
                    {format(new Date(inspectingRegistration.created_at), "EEEE, MMM d, yyyy h:mm a")}
                  </p>
                </div>
                {isPaid && (
                  <div>
                    <span className="text-zinc-500 font-medium">Transaction ID:</span>
                    <p className="font-mono font-semibold text-zinc-800">
                      {inspectingRegistration.transaction_id || "None submitted"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Form Answers (form_data) */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Custom Form Answers
              </h5>
              {inspectingRegistration.form_data &&
              Object.keys(inspectingRegistration.form_data).filter((k) => !k.startsWith("_")).length > 0 ? (
                <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden bg-white text-xs max-h-60 overflow-y-auto">
                  {Object.entries(inspectingRegistration.form_data)
                    .filter(([k]) => !k.startsWith("_"))
                    .map(([key, val]) => {
                      const matchedField = form?.fields?.find((f) => f.id === key);
                      const displayLabel = matchedField ? matchedField.label : key;
                      const formattedVal = Array.isArray(val)
                        ? val.join(", ")
                        : typeof val === "boolean"
                        ? val
                          ? "Yes"
                          : "No"
                        : typeof val === "object" && val !== null
                        ? JSON.stringify(val)
                        : String(val ?? "—");

                      return (
                        <div
                          key={key}
                          className="p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-1 hover:bg-zinc-50/50"
                        >
                          <span className="font-medium text-zinc-700 sm:w-1/3 shrink-0">
                            {displayLabel}
                          </span>
                          <span className="text-zinc-900 font-normal sm:w-2/3 break-words">
                            {formattedVal}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-500">
                  No custom form questions were submitted for this registration.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInspectingRegistration(null)}
                className="text-xs font-medium"
              >
                Close
              </Button>
              {isPaid &&
                (inspectingRegistration.payment_status === "SUBMITTED" ||
                  inspectingRegistration.payment_status === "PENDING") && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const reg = inspectingRegistration;
                      setInspectingRegistration(null);
                      setReviewingPayment(reg);
                    }}
                    className="text-xs font-semibold"
                  >
                    Review Payment
                  </Button>
                )}
            </div>
          </div>
        </Modal>
      )}

      {/* Inspect Ticket Details Modal (Phase 13) */}
      {inspectingTicket && (
        <Modal
          isOpen={!!inspectingTicket}
          onClose={() => setInspectingTicket(null)}
          title={`Entrance Pass #${inspectingTicket.ticket_number}`}
          description={`Pass details and gate scan status for ${inspectingTicket.participant_name}.`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                <div>
                  <span className="text-[11px] font-mono text-zinc-400">Pass Number</span>
                  <p className="font-mono font-bold text-base text-zinc-900">
                    #{inspectingTicket.ticket_number}
                  </p>
                </div>
                <StatusBadge status={inspectingTicket.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500">Attendee:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">{inspectingTicket.participant_name}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span>
                  <p className="font-mono text-zinc-700 mt-0.5 truncate">{inspectingTicket.participant_email}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Issued On:</span>
                  <p className="text-zinc-800 mt-0.5">
                    {format(new Date(inspectingTicket.issued_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Gate Check-in:</span>
                  <p className="text-zinc-800 mt-0.5">
                    {inspectingTicket.checked_in_at ? (
                      <span className="font-semibold text-emerald-700">
                        {format(new Date(inspectingTicket.checked_in_at), "MMM d, h:mm a")}
                      </span>
                    ) : (
                      <span className="text-zinc-400">Not Checked In</span>
                    )}
                  </p>
                </div>
                {inspectingTicket.revoked_at && (
                  <div className="col-span-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-semibold">Revoked At: </span>
                    {format(new Date(inspectingTicket.revoked_at), "MMM d, yyyy h:mm a")}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                {inspectingTicket.status !== "REVOKED" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    onClick={() => {
                      const t = inspectingTicket;
                      setInspectingTicket(null);
                      setRevokingTicket(t);
                    }}
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    Revoke Pass
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium text-zinc-700"
                  onClick={() =>
                    handleResendTicket(inspectingTicket.id, inspectingTicket.participant_email)
                  }
                  isLoading={resendingTicketId === inspectingTicket.id}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Resend Email
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInspectingTicket(null)}
                className="text-xs font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
