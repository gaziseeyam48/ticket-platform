"use client";

import { CheckCircle2, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface TourCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventSlug?: string;
  eventStatus?: string;
}

export function TourCompletionDialog({
  isOpen,
  onClose,
  eventId,
  eventSlug,
  eventStatus,
}: TourCompletionDialogProps) {
  if (!isOpen) return null;

  const isPubliclyAvailable =
    eventStatus === "PUBLISHED" || eventStatus === "LIVE";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#DCE1E8] bg-white p-6 sm:p-7 shadow-2xl space-y-5 text-center animate-in zoom-in-95">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <Sparkles className="h-3 w-3" />
            Walkthrough Complete
          </div>
          <h2
            id="completion-title"
            className="text-xl font-bold text-[#171923] tracking-tight"
          >
            You&apos;re ready for the next step!
          </h2>
          <p className="text-xs sm:text-sm text-[#525B6B] leading-relaxed">
            Your event setup is in place. You can return here anytime to manage registrations, tickets, entrance gates, and event operations.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isPubliclyAvailable && eventSlug && (
            <Link
              href={`/events/${eventSlug}`}
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#171923] bg-white border border-[#DCE1E8] rounded-xl hover:bg-[#F8FAFC] transition-all shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#525B6B]" />
              View Public Page
            </Link>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer"
          >
            <span>Finish & Go to Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
