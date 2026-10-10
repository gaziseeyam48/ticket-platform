"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Building,
  Printer,
  Copy,
  Check,
  CalendarPlus,
  ShieldCheck,
  Clock,
  User,
  Sun,
  SunMedium,
  Ticket as TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface TicketPassData {
  ticketNumber: string;
  status: "ISSUED" | "CHECKED_IN" | "REVOKED" | string;
  participantName: string;
  participantEmailMasked: string;
  category: string;
  issuedAt: string;
  checkedInAt?: string | null;
  revokedAt?: string | null;
  eventName: string;
  eventSlug: string;
  eventStatus: string;
  eventDateStart?: string | null;
  eventDateEnd?: string | null;
  eventLocation?: string | null;
  organizationName: string;
  qrCodeDataUrl: string;
  ticketUrl: string;
}

export function TicketPassView({ ticket }: { ticket: TicketPassData }) {
  const [copied, setCopied] = useState(false);
  const [sunlightMode, setSunlightMode] = useState(false);

  const isCheckedIn = ticket.status === "CHECKED_IN";
  const isRevoked = ticket.status === "REVOKED";
  const isValid = ticket.status === "ISSUED";

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Generate downloadable .ics calendar event
  const handleAddToCalendar = () => {
    if (!ticket.eventDateStart) return;

    const startDate = new Date(ticket.eventDateStart);
    const endDate = ticket.eventDateEnd
      ? new Date(ticket.eventDateEnd)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const formatDateToICS = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d+/g, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TicketPlatform//EntrancePass//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:${ticket.eventName}`,
      `DESCRIPTION:Official Entrance Pass #${ticket.ticketNumber} for ${ticket.participantName}. Access link: ${ticket.ticketUrl}`,
      ticket.eventLocation ? `LOCATION:${ticket.eventLocation}` : "",
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${ticket.eventSlug}-pass.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Print-Only Style Sheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .ticket-card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            max-width: 480px !important;
          }
        }
      `}</style>

      {/* Sunlight Contrast Mode Button for Outdoor Gate Scans */}
      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => setSunlightMode(!sunlightMode)}
          className={cn(
            "text-xs px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium min-h-[44px]",
            sunlightMode
              ? "bg-amber-100 border-amber-300 text-amber-950 font-bold shadow-xs"
              : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs"
          )}
          title={sunlightMode ? "Disable outdoor bright contrast mode" : "Enable outdoor bright contrast mode"}
          aria-label={sunlightMode ? "Disable outdoor bright contrast mode" : "Enable outdoor bright contrast mode"}
        >
          {sunlightMode ? (
            <Sun className="h-4 w-4 text-amber-600 shrink-0" />
          ) : (
            <SunMedium className="h-4 w-4 text-zinc-500 shrink-0" />
          )}
          <span>{sunlightMode ? "Outdoor High Contrast: ON" : "Outdoor Brightness Mode"}</span>
        </button>
      </div>

      {/* Main Boarding Pass Card */}
      <div
        className={cn(
          "ticket-card bg-white rounded-3xl overflow-hidden transition-all",
          sunlightMode
            ? "border-2 border-black shadow-none ring-4 ring-black/5"
            : "border border-zinc-200/90 shadow-sm"
        )}
      >
        {/* Top Header Segment */}
        <div className="p-6 pb-5 space-y-3 bg-zinc-50/50 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
              Verified Admission Pass
            </span>

            {/* Dynamic Status Badge */}
            {isValid && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active • Admissible
              </span>
            )}
            {isCheckedIn && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-zinc-500" />
                Checked In
              </span>
            )}
            {isRevoked && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
                <XCircle className="h-3 w-3 text-rose-600" />
                Revoked
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
              {ticket.eventName}
            </h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <Building className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              {ticket.organizationName}
            </p>
          </div>
        </div>

        {/* Perforated Divider Strip with Side Notches */}
        <div className="relative py-2.5 bg-zinc-50/80 border-y border-dashed border-zinc-200">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#fbfbf9] border-r border-zinc-200/90" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#fbfbf9] border-l border-zinc-200/90" />
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold font-mono">
              Scan Gate Entrance Token
            </span>
          </div>
        </div>

        {/* QR Code Presentation Segment */}
        <div className="p-6 text-center space-y-5">
          {/* QR Code Box */}
          <div className="relative inline-block">
            <div
              className={cn(
                "p-3.5 bg-white rounded-2xl inline-block transition-all",
                sunlightMode
                  ? "border-3 border-black shadow-none ring-4 ring-black/10"
                  : "border border-zinc-200 shadow-2xs"
              )}
            >
              <img
                src={ticket.qrCodeDataUrl}
                alt={`QR code for entrance ticket ${ticket.ticketNumber}`}
                className={cn(
                  "w-44 h-44 object-contain mx-auto transition-all",
                  isRevoked ? "opacity-30 grayscale" : "opacity-100",
                  sunlightMode && "contrast-125 brightness-95"
                )}
              />
            </div>

            {/* Revoked Watermark Overlay */}
            {isRevoked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-rose-600/90 text-white font-mono font-bold text-xs uppercase px-4 py-1.5 rounded-full shadow-lg border border-white tracking-widest -rotate-12">
                  Pass Revoked
                </div>
              </div>
            )}
          </div>

          {/* Ticket Number & Category */}
          <div className="space-y-1">
            <p className="font-mono text-lg font-bold text-zinc-900 tracking-wider">
              #{ticket.ticketNumber}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700">
              <TicketIcon className="h-3 w-3 text-zinc-400" />
              {ticket.category}
            </div>
          </div>

          {/* Alert Status Banners */}
          {isCheckedIn && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Admitted at gate turnstile{" "}
                {ticket.checkedInAt
                  ? format(new Date(ticket.checkedInAt), "MMM d, h:mm a")
                  : ""}
              </span>
            </div>
          )}

          {isRevoked && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-center gap-2 font-medium">
              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                This entrance pass has been revoked by the event organizer. Turnstile scan will be refused.
              </span>
            </div>
          )}

          {/* Attendee Details Grid */}
          <div className="pt-4 border-t border-zinc-100 text-left space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-zinc-100/60">
              <span className="text-zinc-500 font-medium flex items-center gap-1">
                <User className="h-3 w-3 text-zinc-400" /> Attendee
              </span>
              <span className="text-zinc-900 font-semibold">{ticket.participantName}</span>
            </div>

            {ticket.participantEmailMasked && (
              <div className="flex justify-between items-center py-1 border-b border-zinc-100/60">
                <span className="text-zinc-500 font-medium">Registered Account</span>
                <span className="font-mono text-zinc-700 font-medium">
                  {ticket.participantEmailMasked}
                </span>
              </div>
            )}

            {ticket.eventDateStart && (
              <div className="flex justify-between items-center py-1 border-b border-zinc-100/60">
                <span className="text-zinc-500 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-zinc-400" /> Date & Time
                </span>
                <span className="text-zinc-800 font-semibold">
                  {format(new Date(ticket.eventDateStart), "MMM d, yyyy · h:mm a")}
                </span>
              </div>
            )}

            {ticket.eventLocation && (
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500 font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-zinc-400" /> Location
                </span>
                <span className="text-zinc-800 font-medium text-right max-w-[200px] truncate">
                  {ticket.eventLocation}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed">
            Please present this digital entrance pass on your mobile device or printed copy at the event gate scanner.
          </p>
        </div>
      </div>

      {/* Action Utility Buttons (Hidden when printing) */}
      <div className="no-print space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-semibold gap-1.5 shadow-2xs min-h-[44px] cursor-pointer"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Copied Pass Link
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-zinc-400" />
                Copy Pass Link
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs font-semibold gap-1.5 shadow-2xs min-h-[44px] cursor-pointer"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 text-zinc-400" />
            Print / Save PDF
          </Button>
        </div>

        {ticket.eventDateStart && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold gap-1.5 shadow-2xs min-h-[44px] cursor-pointer"
            onClick={handleAddToCalendar}
          >
            <CalendarPlus className="h-4 w-4 text-zinc-400" />
            Add Event to Calendar (.ics)
          </Button>
        )}
      </div>

      <p className="no-print text-center text-[10px] font-mono text-zinc-400">
        TicketPlatform • Cryptographic Token Hash Protocol
      </p>
    </div>
  );
}
