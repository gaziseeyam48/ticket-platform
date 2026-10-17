"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Tag,
  FileText,
  FileEdit,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicationChecklistResult } from "./workspace-status-config";
import { cn } from "@/lib/utils/cn";

interface WorkspaceDraftViewProps {
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
  form: {
    id?: string;
    fields?: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
      placeholder?: string;
    }>;
  } | null;
  checklist: PublicationChecklistResult;
  onPublishClick: () => void;
  onCopyLink: () => void;
  copiedLink: boolean;
  isPublishing?: boolean;
}

export function WorkspaceDraftView({
  event,
  form,
  checklist,
  onPublishClick,
  onCopyLink,
  copiedLink,
  isPublishing = false,
}: WorkspaceDraftViewProps) {
  const isPaid = event.event_type === "PAID";
  const fields = form?.fields || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ========================================================================= */}
      {/* MAIN LEFT WORKSPACE (8 COLS): SETUP CHECKLIST & FORM CONFIGURATION */}
      {/* ========================================================================= */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Publication Readiness Checklist (Interactive & Real-time) */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F4F8]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
                <h3 className="text-sm font-bold text-[#171923]">
                  Publication Readiness Checklist
                </h3>
              </div>
              <p className="text-xs text-[#525B6B] mt-0.5">
                Requirements are validated directly against saved event and form parameters.
              </p>
            </div>

            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border self-start sm:self-auto",
                checklist.isReadyToPublish
                  ? "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]"
                  : "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
              )}
            >
              {checklist.completedCount} of {checklist.totalCount} Complete
            </span>
          </div>

          {/* Checklist Items Grid */}
          <div className="space-y-3">
            {checklist.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
                  item.isComplete
                    ? "bg-[#F8FAFC] border-[#DCE1E8]"
                    : "bg-[#FFFDF7] border-[#FDE68A]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {item.isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-[#087F5B]" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-[#B96B08]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#171923]">
                      {item.label}
                    </h4>
                    <p className="text-xs text-[#525B6B] mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.actionLabel && item.actionHref && (
                  <Link href={item.actionHref} className="self-end sm:self-auto shrink-0">
                    <Button
                      variant={item.isComplete ? "outline" : "secondary"}
                      size="sm"
                      className="text-xs font-semibold shadow-2xs gap-1"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Completion summary */}
          {checklist.isReadyToPublish ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-850 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-900 font-medium">
                All publication requirements are satisfied. Click <strong>Publish Event</strong> in the header to make your registration page public.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>Complete the remaining checklist items above to enable event publication.</span>
            </div>
          )}
        </div>

        {/* 2. Registration Form Configuration Summary */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#525B6B]" />
              <h3 className="text-sm font-semibold text-[#171923]">
                Registration Form Configuration
              </h3>
              <span className="text-xs text-[#525B6B] bg-[#F1F4F8] px-2 py-0.5 rounded-full font-medium border border-[#DCE1E8]">
                {fields.length} question{fields.length === 1 ? "" : "s"}
              </span>
            </div>

            <Link href={`/org/events/${event.id}/form`}>
              <Button size="sm" variant="outline" className="text-xs font-semibold shadow-2xs gap-1.5">
                <FileEdit className="h-3 w-3 text-[#525B6B]" />
                <span>Open Form Builder</span>
              </Button>
            </Link>
          </div>

          {fields.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#B96B08] shadow-2xs">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#78350F]">
                  No registration questions added yet
                </h4>
                <p className="text-xs text-[#92400E] max-w-md mx-auto mt-1 leading-relaxed">
                  Attendees cannot register without a configured form. Add attendee questions such as name, email, and any custom event details.
                </p>
              </div>
              <Link href={`/org/events/${event.id}/form`}>
                <Button size="sm" variant="primary" className="text-xs font-semibold shadow-xs">
                  Build Registration Form
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#525B6B]">
                Attendees will answer these questions in this sequence when registering:
              </p>
              <div className="divide-y divide-[#F1F4F8] border border-[#DCE1E8] rounded-xl overflow-hidden bg-white text-xs">
                {fields.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#F1F4F8] text-[#525B6B] font-mono font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-[#171923] truncate">
                        {f.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-[#667085] bg-[#F1F4F8] px-2 py-0.5 rounded border border-[#DCE1E8]">
                        {f.type}
                      </span>
                      {f.required ? (
                        <span className="text-[10px] text-[#9F1239] font-semibold uppercase bg-[#FFF1F2] px-1.5 py-0.5 rounded border border-[#FECDD3]">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#667085] bg-[#F1F4F8] px-1.5 py-0.5 rounded border border-[#DCE1E8]">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Event Parameters & Schedule Card */}
        <div
          data-tour="event-parameters"
          className="rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#525B6B]" />
              <h3 className="text-sm font-semibold text-[#171923]">
                Event Parameters & Schedule
              </h3>
            </div>
            <Link href={`/org/events/${event.id}/edit`}>
              <Button variant="outline" size="sm" className="text-xs font-medium gap-1 shadow-2xs">
                <FileEdit className="h-3 w-3 text-[#525B6B]" />
                <span>Edit Parameters</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
              <span className="text-[#525B6B] font-medium">Scheduled Date & Time</span>
              <p className="text-sm font-semibold text-[#171923] mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#525B6B]" />
                {event.date_start ? (
                  <span>
                    {format(new Date(event.date_start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    {event.date_end && ` – ${format(new Date(event.date_end), "h:mm a")}`}
                  </span>
                ) : (
                  <span className="text-[#B96B08] font-normal italic">Date not specified</span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8]">
              <span className="text-[#525B6B] font-medium">Venue & Location</span>
              <p className="text-sm font-semibold text-[#171923] mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#525B6B] shrink-0" />
                <span className="truncate">
                  {event.location || (
                    <span className="text-[#B96B08] font-normal italic">Location not specified</span>
                  )}
                </span>
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#525B6B] font-medium">Public URL Slug</span>
                <p className="text-sm font-mono font-semibold text-[#171923] mt-0.5">
                  /events/{event.slug}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium gap-1.5 shadow-2xs self-start sm:self-auto"
                onClick={onCopyLink}
              >
                <Copy className="h-3 w-3 text-[#525B6B]" />
                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDEBAR (4 COLS): ADMISSION & PUBLICATION ADVICE */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 space-y-6">
        {/* Admission Configuration Card */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#525B6B]" />
              <h3 className="text-xs font-semibold text-[#171923]">
                Admission & Pricing
              </h3>
            </div>
            <Link href={`/org/events/${event.id}/edit`}>
              <Button size="sm" variant="outline" className="text-xs font-medium shadow-2xs">
                Edit Pricing
              </Button>
            </Link>
          </div>

          {isPaid ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
                <p className="text-[10px] font-mono uppercase font-semibold text-[#78350F]">
                  Paid Admission Active
                </p>
                <p className="text-base font-bold text-[#78350F] mt-0.5">
                  {event.payment_config?.amount || 0} {event.payment_config?.currency || "USD"}
                </p>
                <p className="text-[11px] text-[#92400E] mt-1">
                  Via {event.payment_config?.payment_method || "Direct Transfer"}
                </p>
              </div>

              {event.payment_config?.account_number && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE1E8] space-y-1">
                  <span className="text-[11px] text-[#525B6B] font-medium">Account / ID:</span>
                  <p className="font-mono font-semibold text-[#171923]">
                    {event.payment_config.account_number}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#E6F7F0] border border-[#A3E6CD] text-xs text-[#06694A] space-y-1">
              <p className="font-semibold text-sm">Free Admission</p>
              <p className="text-[11px] leading-relaxed text-[#05563D]">
                Attendees will receive their digital entrance pass immediately upon submitting the registration form.
              </p>
            </div>
          )}
        </div>

        {/* Ticket Design & Branding Card */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F1F4F8]">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#525B6B]" />
              <h3 className="text-xs font-semibold text-[#171923]">
                Ticket Pass Design
              </h3>
            </div>
            <Link href={`/org/events/${event.id}/ticket-design`}>
              <Button size="sm" variant="outline" className="text-xs font-medium shadow-2xs gap-1">
                Customize
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-[#525B6B] leading-relaxed">
            Personalize the digital entrance pass attendees will receive in their email and present at gate turnstiles.
          </p>
        </div>

        {/* Publication Guidance Box */}
        <div className="rounded-2xl border border-[#DCE1E8] bg-[#FAFBFC] p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-semibold text-[#171923] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#1D4ED8]" />
            What happens after publishing?
          </h3>
          <ul className="text-xs text-[#525B6B] space-y-2 list-disc list-inside leading-relaxed">
            <li>The registration page becomes active for public visitors.</li>
            <li>Attendees can submit answers and claim tickets.</li>
            <li>You can still update details and manage passes anytime.</li>
            <li>On event day, click &ldquo;Start Event&rdquo; to open turnstile check-ins.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
