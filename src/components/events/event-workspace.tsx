"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  Sparkles,
  MoreHorizontal,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { EventLifecyclePanel } from "@/components/events/event-lifecycle-panel";
import { IssueTicketModal } from "@/components/events/issue-ticket-modal";
import { InviteVerifierModal } from "@/components/events/invite-verifier-modal";
import { resendTicketEmail, revokeTicket } from "@/app/actions/ticket.actions";
import { reviewRegistrationPayment } from "@/app/actions/registration.actions";
import { resendVerifierInvite, revokeVerifier } from "@/app/actions/verifier.actions";
import { startEvent, endEvent, updateEventStatus } from "@/app/actions/event.actions";
import {
  getWorkspaceStatusConfig,
  evaluatePublicationChecklist,
} from "@/components/events/workspace-status-config";
import { WorkspaceActionBanner } from "@/components/events/workspace-action-banner";
import { WorkspaceContextualMetrics } from "@/components/events/workspace-contextual-metrics";
import { WorkspaceDraftView } from "@/components/events/workspace-draft-view";
import { WorkspacePublishedView } from "@/components/events/workspace-published-view";
import { WorkspaceLiveView } from "@/components/events/workspace-live-view";
import { WorkspaceEndedView } from "@/components/events/workspace-ended-view";
import { WorkspaceCancelledView } from "@/components/events/workspace-cancelled-view";
import { cn } from "@/lib/utils/cn";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

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
  const { replayTour } = useOnboarding();

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

  // Publish Event Confirmation Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishingEvent, setIsPublishingEvent] = useState(false);

  // Cancel Event Confirmation Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancellingEvent, setIsCancellingEvent] = useState(false);

  // Outcome Summary Copy Feedback
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Secondary Actions Dropdown Menu state & ref
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    if (isActionsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsMenuOpen]);

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

  // Publish Event action
  const handlePublishEvent = async () => {
    setIsPublishingEvent(true);
    try {
      await updateEventStatus(event.id, "PUBLISHED");
      setIsPublishModalOpen(false);
      showToast("Event is now Published! Public registration is open.");
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to publish event", "error");
    } finally {
      setIsPublishingEvent(false);
    }
  };

  // Cancel Event action
  const handleCancelEvent = async () => {
    setIsCancellingEvent(true);
    try {
      await updateEventStatus(event.id, "CANCELLED");
      setIsCancelModalOpen(false);
      showToast("Event has been cancelled. Public registration is offline.");
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Failed to cancel event", "error");
    } finally {
      setIsCancellingEvent(false);
    }
  };

  // Copy Outcome Summary
  const handleCopySummary = () => {
    const summary = [
      `Event Outcome Summary: ${event.name}`,
      `Status: ${event.status}`,
      `Turnout: ${checkinPercentage}% (${metrics.checkedInCount} of ${metrics.ticketsCount} ticket holders checked in)`,
      `Total Registrations: ${metrics.registrationsCount}`,
      `Total Passes Issued: ${metrics.ticketsCount}`,
      `Total Attendees Admitted: ${metrics.checkedInCount}`,
    ].join("\n");
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    showToast("Event outcome summary copied to clipboard!");
    setTimeout(() => setCopiedSummary(false), 2500);
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

  // Contextual Status Config & Publication Checklist
  const workspaceConfig = getWorkspaceStatusConfig(event, form, metrics);
  const publicationChecklist = evaluatePublicationChecklist(event, form);
  const activeVerifiersCount = verifiersList.filter(
    (v) => v.status === "ACTIVE" || v.status === "INVITED"
  ).length;

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

      {/* 2. Cohesive Event Header with Clear State-Driven Primary CTA */}
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
                {isPaid ? "Paid" : "Free"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600 font-medium">
              {(event.date_start || event.date_end) && (
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  {event.date_start &&
                    format(new Date(event.date_start), "EEEE, MMMM d, yyyy · h:mm a")}
                  {event.date_end && ` – ${format(new Date(event.date_end), "h:mm a")}`}
                </span>
              )}

              {event.location && (
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  {event.location}
                </span>
              )}

              <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-0.5 rounded-md border border-zinc-200/70">
                <span className="font-mono text-xs text-zinc-600 font-medium">/{event.slug}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-0.5 text-zinc-400 hover:text-zinc-800 transition-colors rounded cursor-pointer"
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
          <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
            {/* Primary Action Determined by Persisted Event Lifecycle State */}
            {event.status === "DRAFT" && (
              <>
                {!publicationChecklist.items.find((i) => i.id === "form")?.isComplete ? (
                  <Link href={`/org/events/${event.id}/form`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Build Registration Form</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                    onClick={() => setIsPublishModalOpen(true)}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Publish Event</span>
                  </Button>
                )}
              </>
            )}

            {event.status === "PUBLISHED" && (
              <Button
                size="sm"
                variant="positive"
                className="text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                onClick={handleQuickStartEvent}
                disabled={isStartingEvent}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isStartingEvent ? "Starting..." : "Start Event (Go Live)"}</span>
              </Button>
            )}

            {event.status === "LIVE" && (
              <Link href={`/verify?event_id=${event.id}`}>
                <Button
                  size="sm"
                  variant="positive"
                  className="text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Open Gate Scanner</span>
                </Button>
              </Link>
            )}

            {event.status === "ENDED" && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
                onClick={handleCopySummary}
              >
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
                <span>{copiedSummary ? "Copied" : "Copy Summary"}</span>
              </Button>
            )}

            {/* Secondary Action: Edit Event */}
            <Link href={`/org/events/${event.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileEdit className="h-3.5 w-3.5 text-zinc-400" />
                <span>Edit Event</span>
              </Button>
            </Link>

            {/* Secondary Actions Dropdown Menu */}
            <div className="relative" ref={actionsMenuRef}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium px-2 shadow-2xs cursor-pointer"
                onClick={() => setIsActionsMenuOpen((prev) => !prev)}
                aria-label="More actions"
                aria-expanded={isActionsMenuOpen}
              >
                <MoreHorizontal className="h-4 w-4 text-zinc-600" />
              </Button>

              {isActionsMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white border border-zinc-200/90 shadow-lg py-1 z-30 animate-in fade-in-50 zoom-in-95 text-xs">
                  <Link
                    href={`/events/${event.slug}`}
                    target="_blank"
                    onClick={() => setIsActionsMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Public Page</span>
                  </Link>

                  <Link
                    href={`/org/events/${event.id}/ticket-design`}
                    onClick={() => setIsActionsMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <Palette className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Customize Ticket</span>
                  </Link>

                  {(event.status === "PUBLISHED" || event.status === "LIVE") && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        setIsIssueModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer text-left"
                    >
                      <Ticket className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Issue Pass</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      replayTour();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer text-left"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span>Replay Tour</span>
                  </button>

                  {event.status === "LIVE" && (
                    <div className="border-t border-zinc-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setIsEndEventModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer text-left"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>End Event</span>
                      </button>
                    </div>
                  )}

                  {(event.status === "DRAFT" || event.status === "PUBLISHED") && (
                    <div className="border-t border-zinc-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          setIsCancelModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Cancel Event</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Status-Specific Contextual Action Area */}
      <WorkspaceActionBanner
        event={event}
        config={workspaceConfig}
        checklist={publicationChecklist}
        onPublishClick={() => setIsPublishModalOpen(true)}
        onStartEventClick={handleQuickStartEvent}
        onEndEventClick={() => setIsEndEventModalOpen(true)}
        onCancelEventClick={() => setIsCancelModalOpen(true)}
        onReviewPaymentsClick={() => handleTabChange("payments")}
        onTabChange={handleTabChange}
        isActionLoading={isStartingEvent || isPublishingEvent}
      />

      {/* 4. Contextual Metrics Row */}
      <WorkspaceContextualMetrics
        status={workspaceConfig.status}
        isPaid={isPaid}
        metrics={metrics}
        checklist={publicationChecklist}
        formFieldsCount={fields.length}
        event={event}
        verifiersCount={activeVerifiersCount}
      />

      {/* 5. Event Navigation Tabs */}
      <div data-tour="workspace-tabs" className="border-b border-zinc-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Event Tabs">
          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer",
              activeTab === "overview"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("registrations")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
              activeTab === "registrations"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <span>Registrations</span>
            <span
              className={cn(
                "text-xs font-mono px-1.5 py-0.2 rounded",
                activeTab === "registrations"
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-400"
              )}
            >
              {metrics.registrationsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("tickets")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
              activeTab === "tickets"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <span>Tickets</span>
            <span
              className={cn(
                "text-xs font-mono px-1.5 py-0.2 rounded",
                activeTab === "tickets"
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-400"
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
                "pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "payments"
                  ? "border-zinc-900 text-zinc-900 font-semibold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
              )}
            >
              <span>Payments</span>
              {metrics.pendingPaymentsCount > 0 && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {metrics.pendingPaymentsCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleTabChange("verifiers")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
              activeTab === "verifiers"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <span>Gate Staff</span>
            <span
              className={cn(
                "text-xs font-mono px-1.5 py-0.2 rounded",
                activeTab === "verifiers"
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-400"
              )}
            >
              {verifiersList.length}
            </span>
          </button>
        </nav>
      </div>

      {/* 5. Workspace Tab Views */}
      {/* 5. Workspace Tab Views */}
      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (Status-Driven Contextual Architecture) */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <>
          {event.status === "DRAFT" && (
            <WorkspaceDraftView
              event={event}
              form={form}
              checklist={publicationChecklist}
              onPublishClick={() => setIsPublishModalOpen(true)}
              onCopyLink={handleCopyLink}
              copiedLink={copiedLink}
              isPublishing={isPublishingEvent}
            />
          )}

          {event.status === "PUBLISHED" && (
            <WorkspacePublishedView
              event={event}
              metrics={metrics}
              recentRegistrations={initialRegistrations}
              verifiersCount={activeVerifiersCount}
              onStartEventClick={handleQuickStartEvent}
              onReviewPaymentClick={(reg) => setReviewingPayment(reg)}
              onCopyLink={handleCopyLink}
              onTabChange={handleTabChange}
              onInviteVerifierClick={() => setIsInviteVerifierModalOpen(true)}
              copiedLink={copiedLink}
              isStartingEvent={isStartingEvent}
              formFieldsCount={fields.length}
            />
          )}

          {event.status === "LIVE" && (
            <WorkspaceLiveView
              event={event}
              metrics={metrics}
              tickets={ticketsList}
              verifiersList={verifiersList}
              onEndEventClick={() => setIsEndEventModalOpen(true)}
              onInviteVerifierClick={() => setIsInviteVerifierModalOpen(true)}
              onTabChange={handleTabChange}
            />
          )}

          {event.status === "ENDED" && (
            <WorkspaceEndedView
              event={event}
              metrics={metrics}
              tickets={ticketsList}
              onTabChange={handleTabChange}
              onCopySummary={handleCopySummary}
              copiedSummary={copiedSummary}
            />
          )}

          {event.status === "CANCELLED" && (
            <WorkspaceCancelledView
              event={event}
              metrics={metrics}
              registrations={initialRegistrations}
              onTabChange={handleTabChange}
            />
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTRATIONS */}
      {/* ========================================================================= */}
      {activeTab === "registrations" && (
        <div className="rounded-2xl border border-[#DCE1E8] bg-white shadow-2xs overflow-hidden space-y-0">
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-[#DCE1E8] bg-[#F1F4F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#171923]">
                All Event Registrations
              </h3>
              <span className="text-xs text-[#525B6B] bg-white border border-[#DCE1E8] px-2.5 py-0.5 rounded-full font-medium">
                {initialRegistrations.length}
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                size="sm"
                value={regFilter}
                onChange={setRegFilter}
                className="w-44"
                options={[
                  { value: "ALL", label: "All Statuses", indicatorColor: "#667085" },
                  { value: "CONFIRMED", label: "Confirmed / Registered", indicatorColor: "#087F5B" },
                  { value: "PENDING", label: "Pending Payment", indicatorColor: "#B96B08" },
                  { value: "CANCELLED", label: "Cancelled", indicatorColor: "#C2415D" },
                ]}
              />

              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <Search className="h-3.5 w-3.5 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search attendee or email..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] text-[#171923] placeholder:text-[#8C96A5] shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)] hover:border-[#B4BDC9] hover:bg-white focus:outline-none focus:border-[#171923] focus:ring-2 focus:ring-[#171923]/10 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#F1F4F8] flex items-center justify-center text-[#667085]">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#171923]">
                {regSearch || regFilter !== "ALL" ? "No matching registrations" : "No registrations received yet"}
              </h4>
              <p className="text-xs text-[#525B6B] max-w-sm mx-auto">
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
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] text-xs font-semibold">
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Attendee</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Registration Status</th>
                    {isPaid && <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Payment Status</th>}
                    {isPaid && <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Transaction ID</th>}
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Registered At</th>
                    <th className="py-3.5 px-4 text-right font-semibold text-[#525B6B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#171923] text-sm">{reg.participant_name}</p>
                        <p className="text-[13px] text-[#525B6B]">{reg.email}</p>
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
                        <td className="py-3.5 px-4 font-mono text-xs text-[#525B6B]">
                          {reg.transaction_id || "—"}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-sm text-[#525B6B]">
                        {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-medium h-8 px-2.5 gap-1 text-[#171923] shadow-2xs"
                            onClick={() => setInspectingRegistration(reg)}
                          >
                            <Eye className="h-3.5 w-3.5 text-[#525B6B]" />
                            Inspect
                          </Button>
                          {isPaid &&
                            (reg.payment_status === "SUBMITTED" || reg.payment_status === "PENDING") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs font-semibold h-8 px-2.5 bg-[#FFFBEB] text-[#B96B08] border-[#FDE68A] hover:bg-[#FEF3C7]"
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
        <div className="rounded-2xl border border-[#DCE1E8] bg-white shadow-2xs overflow-hidden space-y-0">
          {/* Header & Filter Controls */}
          <div className="p-4 sm:p-5 border-b border-[#DCE1E8] bg-[#F1F4F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#171923]">
                Entrance Passes & Tickets
              </h3>
              <span className="text-xs text-[#525B6B] bg-white border border-[#DCE1E8] px-2.5 py-0.5 rounded-full font-medium">
                {ticketsList.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter */}
              <Select
                size="sm"
                value={ticketFilter}
                onChange={setTicketFilter}
                className="w-40"
                options={[
                  { value: "ALL", label: "All Passes", indicatorColor: "#667085" },
                  { value: "ISSUED", label: "Issued", indicatorColor: "#2563EB" },
                  { value: "CHECKED_IN", label: "Checked In", indicatorColor: "#087F5B" },
                  { value: "REVOKED", label: "Revoked", indicatorColor: "#C2415D" },
                ]}
              />

              {/* Search */}
              <div className="relative w-48 sm:w-56">
                <Search className="h-3.5 w-3.5 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ticket # or name..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] text-[#171923] placeholder:text-[#8C96A5] shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)] hover:border-[#B4BDC9] hover:bg-white focus:outline-none focus:border-[#171923] focus:ring-2 focus:ring-[#171923]/10 focus:bg-white transition-all"
                />
              </div>

              {/* Customize Ticket Button */}
              <Link href={`/org/events/${event.id}/ticket-design`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 border-[#DCE1E8] text-[#171923] hover:bg-white shadow-2xs"
                >
                  <Palette className="h-3.5 w-3.5 text-[#525B6B]" />
                  Customize Ticket
                </Button>
              </Link>

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
              <div className="mx-auto w-12 h-12 rounded-full bg-[#F1F4F8] flex items-center justify-center text-[#667085]">
                <Ticket className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#171923]">
                {ticketSearch || ticketFilter !== "ALL"
                  ? "No matching passes found"
                  : "No passes issued yet"}
              </h4>
              <p className="text-xs text-[#525B6B] max-w-sm mx-auto">
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
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] text-xs font-semibold">
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Pass Number</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Attendee</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Issued At</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Checked In At</th>
                    <th className="py-3.5 px-4 text-right font-semibold text-[#525B6B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-sm text-[#171923]">
                        {t.ticket_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#171923] text-sm">{t.participant_name}</p>
                        <p className="text-[13px] text-[#525B6B]">{t.participant_email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#525B6B]">
                        {format(new Date(t.issued_at), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#525B6B]">
                        {t.checked_in_at ? (
                          <span className="text-[#087F5B] font-medium">
                            {format(new Date(t.checked_in_at), "MMM d, h:mm a")}
                          </span>
                        ) : (
                          <span className="text-[#667085]">Not verified</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-medium h-8 px-2.5 gap-1 text-[#171923] shadow-2xs"
                            onClick={() => setInspectingTicket(t)}
                            title="Inspect Pass"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#525B6B]" />
                            Inspect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-medium h-8 px-2.5 gap-1 shadow-2xs"
                            onClick={() => handleResendTicket(t.id, t.participant_email)}
                            isLoading={resendingTicketId === t.id}
                            title="Resend Entrance Pass Email"
                          >
                            <Mail className="h-3.5 w-3.5 text-[#525B6B]" />
                            Resend
                          </Button>
                          {t.status !== "REVOKED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-medium h-8 px-2.5 gap-1 text-[#C2415D] hover:text-[#9F1239] hover:bg-[#FFF1F2] border-[#FECDD3]"
                              onClick={() => setRevokingTicket(t)}
                              title="Revoke Pass"
                            >
                              <Ban className="h-3.5 w-3.5 text-[#C2415D]" />
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-[#C2415D] px-2 py-0.5 bg-[#FFF1F2] border border-[#FECDD3] rounded">
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
                  ? "bg-[#171923] text-white border-[#171923] shadow-xs"
                  : "bg-white text-[#171923] border-[#DCE1E8] hover:border-[#171923] shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "ALL" ? "text-zinc-300" : "text-[#667085]")}>
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
                  ? "bg-[#B96B08] text-white border-[#B96B08] shadow-xs"
                  : "bg-white text-[#B96B08] border-[#DCE1E8] hover:border-[#FDE68A] shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "SUBMITTED" ? "text-amber-100" : "text-[#B96B08]")}>
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
                  ? "bg-[#525B6B] text-white border-[#525B6B] shadow-xs"
                  : "bg-white text-[#525B6B] border-[#DCE1E8] hover:border-[#9AA4B2] shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "PENDING" ? "text-zinc-200" : "text-[#525B6B]")}>
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
                  ? "bg-[#087F5B] text-white border-[#087F5B] shadow-xs"
                  : "bg-white text-[#087F5B] border-[#DCE1E8] hover:border-[#A3E6CD] shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "APPROVED" ? "text-emerald-100" : "text-[#087F5B]")}>
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
                  ? "bg-[#C2415D] text-white border-[#C2415D] shadow-xs"
                  : "bg-white text-[#C2415D] border-[#DCE1E8] hover:border-[#FECDD3] shadow-2xs"
              )}
            >
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", paymentFilter === "REJECTED" ? "text-rose-100" : "text-[#C2415D]")}>
                Rejected
              </p>
              <p className="text-lg font-bold mt-0.5">{paymentStats.rejected}</p>
            </button>
          </div>

          <div className="rounded-2xl border border-[#DCE1E8] bg-white shadow-2xs overflow-hidden space-y-0">
            {/* Header with Search and Filter */}
            <div className="p-4 sm:p-5 border-b border-[#DCE1E8] bg-[#F1F4F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#171923]">
                  Payment Submissions & Approvals
                </h3>
                <span className="text-xs text-[#525B6B] bg-white border border-[#DCE1E8] px-2.5 py-0.5 rounded-full font-medium">
                  {paymentRegistrations.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  size="sm"
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  className="w-48"
                  options={[
                    { value: "ALL", label: "All Payments", indicatorColor: "#667085" },
                    { value: "SUBMITTED", label: "Awaiting Verification", indicatorColor: "#B96B08" },
                    { value: "PENDING", label: "Pending Submission", indicatorColor: "#B96B08" },
                    { value: "APPROVED", label: "Approved", indicatorColor: "#087F5B" },
                    { value: "REJECTED", label: "Rejected", indicatorColor: "#C2415D" },
                  ]}
                />

                <div className="relative w-48 sm:w-56">
                  <Search className="h-3.5 w-3.5 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search attendee or TrxID..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] text-[#171923] placeholder:text-[#8C96A5] shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)] hover:border-[#B4BDC9] hover:bg-white focus:outline-none focus:border-[#171923] focus:ring-2 focus:ring-[#171923]/10 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {paymentRegistrations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#F1F4F8] flex items-center justify-center text-[#667085]">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-[#171923]">
                  {paymentSearch || paymentFilter !== "ALL"
                    ? "No matching payment records found"
                    : "No payment submissions yet"}
                </h4>
                <p className="text-xs text-[#525B6B] max-w-sm mx-auto">
                  When attendees register for this paid pass, their submitted transaction IDs will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] text-xs font-semibold">
                      <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Attendee</th>
                      <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Transaction ID / Reference</th>
                      <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Payment Status</th>
                      <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Date Submitted</th>
                      <th className="py-3.5 px-4 text-right font-semibold text-[#525B6B]">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
                    {paymentRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#F7F8FA] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#171923] text-sm">{reg.participant_name}</p>
                          <p className="text-[13px] text-[#525B6B]">{reg.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-sm text-[#171923]">
                          {reg.transaction_id ? (
                            <span className="px-2 py-0.5 rounded bg-[#F1F4F8] border border-[#DCE1E8]">
                              {reg.transaction_id}
                            </span>
                          ) : (
                            <span className="text-[#667085] font-normal">Pending submission</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={reg.payment_status || "PENDING"} />
                        </td>
                        <td className="py-3.5 px-4 text-sm text-[#525B6B]">
                          {format(new Date(reg.created_at), "MMM d, yyyy h:mm a")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {reg.payment_status === "SUBMITTED" || reg.payment_status === "PENDING" ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs font-semibold h-8 px-3"
                              onClick={() => setReviewingPayment(reg)}
                            >
                              Review & Verify
                            </Button>
                          ) : (
                            <span className="text-xs text-[#667085] font-medium">Reviewed</span>
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
        <div className="rounded-2xl border border-[#DCE1E8] bg-white shadow-2xs overflow-hidden space-y-0">
          {/* Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-[#DCE1E8] bg-[#F1F4F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#171923]">
                  Entrance Gate Staff & Verifiers
                </h3>
                <span className="text-xs text-[#525B6B] bg-white border border-[#DCE1E8] px-2.5 py-0.5 rounded-full font-medium">
                  {verifiersList.length}
                </span>
              </div>
              <p className="text-xs text-[#525B6B] mt-0.5">
                Delegate temporary QR ticket verification access via single-click magic links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="h-3.5 w-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter staff by name or email..."
                  value={verifierSearch}
                  onChange={(e) => setVerifierSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 text-xs font-medium rounded-xl border border-[#DCE1E8] bg-[#FBFBFC] text-[#171923] placeholder:text-[#9AA4B2] placeholder:font-normal shadow-[0_1px_2px_rgba(23,25,35,0.04),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:border-[#B4BDC9] hover:bg-white focus:outline-none focus:border-[#171923] focus:ring-2 focus:ring-[#171923]/10 focus:bg-white transition-all"
                />
              </div>

              <Button
                variant="positive"
                size="sm"
                className="text-xs font-semibold gap-1.5 shrink-0"
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
              <div className="w-12 h-12 rounded-2xl bg-[#F1F4F8] flex items-center justify-center mx-auto text-[#667085]">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#171923]">
                  {verifiersList.length === 0 ? "No gate staff invited yet" : "No staff match your search"}
                </h4>
                <p className="text-xs text-[#525B6B] max-w-sm mx-auto mt-1">
                  Invite security personnel or event volunteers to scan attendee entrance passes.
                  They do not need an account or password to verify passes.
                </p>
              </div>
              {verifiersList.length === 0 && (
                <Button
                  variant="positive"
                  size="sm"
                  className="text-xs font-semibold gap-1.5"
                  onClick={() => setIsInviteVerifierModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Invite First Gate Staff
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#DCE1E8] bg-[#F1F4F8] text-[#525B6B] text-xs font-semibold">
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Staff Member</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Access Status</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Access Window / Expiry</th>
                    <th className="py-3.5 px-4 font-semibold text-[#525B6B]">Last Entrance Scan</th>
                    <th className="py-3.5 px-4 text-right font-semibold text-[#525B6B]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EDF2] text-[#171923]">
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
                        <tr key={v.id} className="hover:bg-[#F7F8FA] transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-[#171923] text-sm">{v.name}</p>
                            <p className="text-xs text-[#525B6B] font-mono">{v.email}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={displayStatus} />
                          </td>
                          <td className="py-3.5 px-4 text-sm text-[#525B6B]">
                            <span className="font-medium text-[#171923]">
                              {format(new Date(v.expires_at), "MMM d, yyyy h:mm a")}
                            </span>
                            {isExpired && (
                              <span className="block text-xs text-[#C2415D] font-medium">
                                (Window lapsed)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-sm text-[#525B6B]">
                            {v.last_accessed_at ? (
                              format(new Date(v.last_accessed_at), "MMM d, yyyy h:mm a")
                            ) : (
                              <span className="text-[#667085]">Never checked in</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {v.status !== "REVOKED" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 px-2.5 text-[#171923] border-[#DCE1E8] hover:bg-[#F1F4F8] shadow-2xs"
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
                                    className="text-xs h-7 px-2 text-[#C2415D] hover:text-[#9F1239] hover:bg-[#FFF1F2] border-[#FECDD3]"
                                    disabled={revokingVerifierId === v.id}
                                    onClick={() => handleRevokeVerifier(v.id, v.name)}
                                    title="Revoke gate scanner credentials immediately"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              {v.status === "REVOKED" && (
                                <span className="text-[11px] text-[#C2415D] font-medium italic pr-2">
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F4F8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-medium text-[#C2415D] hover:text-[#9F1239] hover:bg-[#FFF1F2] border-[#FECDD3]"
                onClick={() => handleReviewPaymentAction("REJECT")}
                disabled={isReviewingLoading}
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="positive"
                size="sm"
                className="text-xs font-semibold"
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
          <p className="text-xs text-[#525B6B] leading-relaxed">
            Ending <strong className="text-[#171923]">{event.name}</strong> will immediately close entrance gate
            verification scanners and deactivate delegated verifier links. Attendee records and check-in
            history will be permanently preserved.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1F4F8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEndEventModalOpen(false)}
              className="text-xs font-medium text-[#525B6B] border-[#DCE1E8] hover:bg-[#F1F4F8] cursor-pointer"
            >
              Keep Live
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleQuickEndEvent}
              className="bg-[#B96B08] hover:bg-[#92400E] text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-2xs cursor-pointer"
            >
              End Event & Close Gates
            </Button>
          </div>
        </div>
      </Modal>

      {/* Publish Event Confirmation Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Event to the Public?"
        description="Make this event accessible to attendees."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#525B6B] leading-relaxed">
            Publishing <strong className="text-[#171923]">{event.name}</strong> will activate the public registration page at{" "}
            <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">
              /events/{event.slug}
            </code>
            . Attendees will be able to register and receive entrance tickets immediately.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F4F8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPublishModalOpen(false)}
              className="text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePublishEvent}
              isLoading={isPublishingEvent}
              className="text-xs font-semibold gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Publish Event Now</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Event Confirmation Modal (Destructive Guard) */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel This Event?"
        description="Irreversible cancellation."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#881337]">
              <AlertTriangle className="h-4 w-4 text-[#C2415D] shrink-0" />
              <span>Warning: Permanent Cancellation</span>
            </div>
            <p className="leading-relaxed text-[#9F1239]">
              Cancelling <strong className="text-[#171923]">{event.name}</strong> will immediately stop participant registrations, void all existing entrance tickets, and mark the event as inactive. Turnstile scanners will reject any attempts to scan tickets for this event. This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F4F8]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
              className="text-xs font-medium"
            >
              Keep Event Active
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleCancelEvent}
              isLoading={isCancellingEvent}
              className="text-xs font-semibold"
            >
              Yes, Cancel Event
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
            <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#9F1239] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#881337]">
                <AlertTriangle className="h-4 w-4 text-[#C2415D] shrink-0" />
                <span>Dangerous Action: Irreversible Pass Invalidation</span>
              </div>
              <p className="leading-relaxed text-[#9F1239]">
                Revoking this pass will immediately void ticket{" "}
                <strong className="font-mono">#{revokingTicket.ticket_number}</strong>. Turnstile gates and
                gate verifiers will reject this pass if scanned. This action is recorded in the organization audit log.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F1F4F8] border border-[#DCE1E8] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#525B6B]">Ticket Number:</span>
                <span className="font-mono font-semibold text-[#171923]">
                  #{revokingTicket.ticket_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B6B]">Attendee:</span>
                <span className="font-semibold text-[#171923]">{revokingTicket.participant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B6B]">Email:</span>
                <span className="font-mono text-[#525B6B]">{revokingTicket.participant_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525B6B]">Current Status:</span>
                <StatusBadge status={revokingTicket.status} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171923]">
                Revocation Reason (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Duplicate registration, refund requested, disciplinary action"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-[#DCE1E8] bg-[#FBFBFC] text-[#171923] placeholder:text-[#9AA4B2] placeholder:font-normal shadow-[0_1px_2px_rgba(23,25,35,0.04),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:border-[#B4BDC9] hover:bg-white focus:outline-none focus:border-[#171923] focus:ring-2 focus:ring-[#171923]/10 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F4F8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRevokingTicket(null);
                  setRevokeReason("");
                }}
                disabled={isRevokingTicketLoading}
                className="text-xs font-medium text-[#525B6B] border-[#DCE1E8] hover:bg-[#F1F4F8]"
              >
                Keep Pass Active
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRevokeTicketConfirm}
                isLoading={isRevokingTicketLoading}
                className="text-xs font-semibold px-4 h-9"
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
