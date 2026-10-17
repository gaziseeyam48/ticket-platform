"use client";

import Link from "next/link";
import {
  FileText,
  FileEdit,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react";
import {
  WorkspaceStatusConfig,
  PublicationChecklistResult,
} from "./workspace-status-config";
import { cn } from "@/lib/utils/cn";

interface WorkspaceActionBannerProps {
  event: {
    id: string;
    name: string;
    slug: string;
    status: string;
    event_type: "FREE" | "PAID";
  };
  config: WorkspaceStatusConfig;
  checklist?: PublicationChecklistResult;
  onPublishClick?: () => void;
  onStartEventClick?: () => void;
  onEndEventClick?: () => void;
  onCancelEventClick?: () => void;
  onReviewPaymentsClick?: () => void;
  onTabChange?: (tab: "overview" | "registrations" | "tickets" | "payments" | "verifiers") => void;
  isActionLoading?: boolean;
}

export function WorkspaceActionBanner({
  event,
  config,
  checklist,
  onPublishClick,
  onReviewPaymentsClick,
  onTabChange,
}: WorkspaceActionBannerProps) {
  const status = config.status;

  // For DRAFT with blockers: Show clear, actionable resolution guidance
  if (status === "DRAFT") {
    const isReady = checklist?.isReadyToPublish;
    return (
      <aside
        data-tour="lifecycle-panel"
        aria-label="Event Setup Guidance"
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-xs border transition-colors",
          isReady
            ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-900"
            : "bg-amber-50/80 border-amber-200/80 text-amber-900"
        )}
      >
        <div className="flex items-center gap-2">
          {isReady ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <span className="font-medium">
            {isReady
              ? "All requirements are satisfied. The event is ready to be published."
              : config.blockerMessage || "Complete the remaining setup steps before publishing."}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isReady && config.primaryAction.href && (
            <Link
              href={config.primaryAction.href}
              className="font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 underline underline-offset-2"
            >
              <span>{config.primaryAction.label}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          {isReady && onPublishClick && (
            <button
              type="button"
              onClick={onPublishClick}
              className="font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <span>Publish Now</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </aside>
    );
  }

  // For PUBLISHED: Concise 1-line guidance without repeating header buttons or counts
  if (status === "PUBLISHED") {
    return (
      <aside
        data-tour="lifecycle-panel"
        aria-label="Published Event Guidance"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="leading-relaxed">
          Public registrations are open. When ready on event day, use{" "}
          <strong className="text-zinc-900 font-semibold">Start Event (Go Live)</strong> in the header to activate entrance gates.
        </span>
      </aside>
    );
  }

  // For LIVE: Concise turnstile operational notice
  if (status === "LIVE") {
    return (
      <aside
        data-tour="lifecycle-panel"
        aria-label="Live Event Operations Guidance"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900"
      >
        <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse shrink-0" />
        <span className="leading-relaxed">
          Event is live. Turnstiles and QR verification scanners are active. Launch scanner from the header or operations card below.
        </span>
      </aside>
    );
  }

  // For ENDED: Historical closeout notice
  if (status === "ENDED") {
    return (
      <aside
        data-tour="lifecycle-panel"
        aria-label="Ended Event Guidance"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600"
      >
        <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
        <span className="leading-relaxed">
          This event has officially concluded. Entrance gates are closed and historical attendance records are archived.
        </span>
      </aside>
    );
  }

  // For CANCELLED: Operations suspended notice
  if (status === "CANCELLED") {
    return (
      <aside
        data-tour="lifecycle-panel"
        aria-label="Cancelled Event Notice"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
      >
        <Ban className="h-3.5 w-3.5 text-rose-500 shrink-0" />
        <span className="leading-relaxed font-medium">
          This event has been cancelled. Public registration and ticket verification scanners are inactive.
        </span>
      </aside>
    );
  }

  return null;
}
