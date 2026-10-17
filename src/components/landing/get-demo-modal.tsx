"use client";

import React, { useState } from "react";
import {
  X,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface GetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetDemoModal({ isOpen, onClose }: GetDemoModalProps) {
  const [copiedType, setCopiedType] = useState<"whatsapp" | "gmail" | null>(null);

  const whatsappNumber = "+8801325881388";
  const whatsappUrl =
    "https://wa.me/8801325881388?text=Hello%20Gazi%2C%20I%20would%20like%20to%20request%20a%20demo%20for%20TicketKoi.";

  const emailAddress = "hellogaziseeyam@gmail.com";
  const gmailWebUrl =
    "https://mail.google.com/mail/?view=cm&fs=1&to=hellogaziseeyam@gmail.com&su=TicketKoi%20Demo%20Request&body=Hi%20Gazi%2C%0A%0AI%20would%20like%20to%20request%20a%20demo%20of%20TicketKoi%20for%20my%20event.%0A%0AOrganization%20Name%3A%20%0AEvent%20Name%3A%20%0AEstimated%20Attendees%3A%20";

  const handleCopy = async (text: string, type: "whatsapp" | "gmail") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      hideHeader
      className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200/90 shadow-2xl text-left"
    >
      <div className="space-y-6">
        {/* Header with single clean close button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Invite-Only Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Request an Organizer Demo
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm">
              Public signup is currently paused. Connect directly with our team to explore a
              personalized demo workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Channels List */}
        <div className="space-y-3.5">
          {/* Channel 1: WhatsApp */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-[#FBFBFA] border border-zinc-200/80 hover:border-emerald-500/50 transition-all space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-[#25D366] fill-[#25D366]/20" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900">WhatsApp</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-zinc-600 mt-0.5">
                    {whatsappNumber}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-normal">
              Chat directly with founder Gazi Seeyam for quick setup and walkthrough.
            </p>

            {/* Clean 2-column actions */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <span>Open WhatsApp</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(whatsappNumber, "whatsapp")}
                className="h-9.5 px-3 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === "whatsapp" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Channel 2: Email / Gmail */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-[#FBFBFA] border border-zinc-200/80 hover:border-zinc-300 transition-all space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Mail className="h-5 w-5 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900">Email</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium">
                      Gmail
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-zinc-600 mt-0.5 truncate">
                    {emailAddress}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-normal">
              Send your event outline, expected attendee volume, or custom needs.
            </p>

            {/* Clean 2-column actions */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <a
                href={gmailWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <span>Open Gmail</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(emailAddress, "gmail")}
                className="h-9.5 px-3 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === "gmail" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Reassurance */}
        <div className="pt-1 flex items-center gap-2 text-xs text-zinc-500">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>Founder-led setup • We&apos;ll help configure tickets, turnstiles & payments.</span>
        </div>
      </div>
    </Modal>
  );
}
