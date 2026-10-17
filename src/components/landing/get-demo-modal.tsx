"use client";

import React, { useState } from "react";
import Image from "next/image";
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
      className="p-6 sm:p-7 rounded-2xl bg-white border border-[#DDE5E2] shadow-2xl text-left"
    >
      <div className="space-y-6">
        {/* Header with single clean close button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-white border border-[#DDE5E2] p-1 flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <Image
                src="/logo.png"
                alt="TicketKoi Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EDF4F2] border border-[#006B5B]/30 text-[11px] font-mono uppercase tracking-wider text-[#006B5B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B] animate-pulse" />
                <span>Invite-Only Access</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211F]">
                Request an Organizer Demo
              </h2>
              <p className="text-xs sm:text-sm text-[#52615D] leading-relaxed max-w-sm">
                Public signup is currently paused. Connect directly with our team to explore a
                personalized demo workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#66736F] hover:text-[#17211F] hover:bg-[#F5F7F8] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Channels List */}
        <div className="space-y-3.5">
          {/* Channel 1: WhatsApp */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-[#F5F7F8] border border-[#DDE5E2] hover:border-[#006B5B]/40 transition-all space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-[#EDF4F2] text-[#006B5B] flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-[#25D366] fill-[#25D366]/20" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#17211F]">WhatsApp</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20 font-medium">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-[#17211F] mt-0.5">
                    {whatsappNumber}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#52615D] leading-normal">
              Chat directly with founder Gazi Seeyam for quick setup and walkthrough.
            </p>

            {/* Clean responsive actions (stacked on small mobile, 2-col on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9.5 px-3 rounded-lg bg-[#006B5B] hover:bg-[#00564A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
              >
                <span>Open WhatsApp</span>
                <ExternalLink className="h-3 w-3 text-white/80" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(whatsappNumber, "whatsapp")}
                className="h-9.5 px-3 rounded-lg bg-white hover:bg-[#EDF4F2]/50 border border-[#DDE5E2] text-xs font-medium text-[#17211F] hover:border-[#006B5B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
              >
                {copiedType === "whatsapp" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#006B5B]" />
                    <span className="text-[#006B5B] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#52615D]" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Channel 2: Email / Gmail */}
          <div className="p-4 sm:p-4.5 rounded-xl bg-[#F5F7F8] border border-[#DDE5E2] hover:border-[#006B5B]/40 transition-all space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-[#FDEEEA] border border-[#F04A24]/20 flex items-center justify-center text-[#F04A24] shrink-0">
                  <Mail className="h-5 w-5 text-[#F04A24]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#17211F]">Email</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#52615D] border border-[#DDE5E2] font-medium">
                      Gmail
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-[#17211F] mt-0.5 truncate">
                    {emailAddress}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#52615D] leading-normal">
              Send your event outline, expected attendee volume, or custom needs.
            </p>

            {/* Clean responsive actions (stacked on small mobile, 2-col on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <a
                href={gmailWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9.5 px-3 rounded-lg bg-[#006B5B] hover:bg-[#00564A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
              >
                <span>Open Gmail</span>
                <ExternalLink className="h-3 w-3 text-white/80" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(emailAddress, "gmail")}
                className="h-9.5 px-3 rounded-lg bg-white hover:bg-[#EDF4F2]/50 border border-[#DDE5E2] text-xs font-medium text-[#17211F] hover:border-[#006B5B] flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
              >
                {copiedType === "gmail" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#006B5B]" />
                    <span className="text-[#006B5B] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#52615D]" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Reassurance */}
        <div className="pt-1 flex items-center gap-2 text-xs text-[#52615D]">
          <Sparkles className="h-3.5 w-3.5 text-[#FFBE2E] shrink-0" />
          <span>Founder-led setup • We&apos;ll help configure tickets, turnstiles &amp; payments.</span>
        </div>
      </div>
    </Modal>
  );
}
