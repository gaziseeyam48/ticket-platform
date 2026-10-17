"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export function SignUpForm() {
  const [copiedType, setCopiedType] = useState<"whatsapp" | "gmail" | null>(null);

  const whatsappNumber = "+8801325881388";
  const whatsappUrl =
    "https://wa.me/8801325881388?text=Hello%20Gazi%2C%20I%20would%20like%20to%20request%20early%20access%20for%20TicketKoi.";

  const emailAddress = "hellogaziseeyam@gmail.com";
  const gmailWebUrl =
    "https://mail.google.com/mail/?view=cm&fs=1&to=hellogaziseeyam@gmail.com&su=TicketKoi%20Organizer%20Access%20Request&body=Hi%20Gazi%2C%0A%0AI%20would%20like%20to%20request%20access%20to%20TicketKoi%20for%20my%20event.%0A%0AOrganization%20Name%3A%20%0AEstimated%20Attendees%3A%20";
  const mailtoUrl =
    "mailto:hellogaziseeyam@gmail.com?subject=TicketKoi%20Organizer%20Access%20Request";

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
    <Card className="border-zinc-200/90 bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-zinc-900 text-white p-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono uppercase tracking-wider text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Public Signup Paused</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-white">
          Request Organizer Access
        </CardTitle>
        <CardDescription className="text-xs text-zinc-300 leading-relaxed">
          Public registration is temporarily paused while we onboard event organizers through
          personalized demos. Reach out below to get your organization set up immediately.
        </CardDescription>
      </div>

      <CardContent className="p-6 space-y-4 bg-[#FAFAFA]">
        {/* Option 1: WhatsApp */}
        <div className="p-4 rounded-xl bg-white border border-emerald-500/30 hover:border-emerald-500/60 shadow-xs transition-all space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageCircle className="h-5 w-5 text-[#25D366] fill-[#25D366]/20" />
              </div>
              <div>
                <span className="font-semibold text-sm text-zinc-900 block">WhatsApp</span>
                <span className="text-[11px] font-mono text-zinc-500">{whatsappNumber}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Fastest
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
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

        {/* Option 2: Gmail */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 shadow-xs transition-all space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Mail className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <span className="font-semibold text-sm text-zinc-900 block">Email (Gmail)</span>
                <span className="text-[11px] font-mono text-zinc-500">{emailAddress}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium">
              Gmail
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
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

        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>We respond quickly and can provision your event workspace within the hour.</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-3 pt-3 pb-6 bg-white border-t border-zinc-100">
        <p className="text-xs text-center text-zinc-500">
          Already have an organizer account?{" "}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>

        <Link
          href="/"
          className="text-xs text-center text-zinc-400 hover:text-zinc-700 flex items-center justify-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to homepage</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
