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
  User,
  Sun,
  SunMedium,
  Ticket as TicketIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  TicketDesignConfig,
  DEFAULT_TICKET_DESIGN,
} from "@/lib/types/ticket-design";

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
  ticketDesign?: TicketDesignConfig;
}

export interface TicketPassViewProps {
  ticket: TicketPassData;
  design?: TicketDesignConfig;
  previewMode?: boolean;
  outdoorMode?: boolean;
  className?: string;
}

export function TicketPassView({
  ticket,
  design: propDesign,
  previewMode = false,
  outdoorMode: propOutdoorMode,
  className,
}: TicketPassViewProps) {
  const [copied, setCopied] = useState(false);
  const [internalSunlightMode, setInternalSunlightMode] = useState(false);
  const sunlightMode = previewMode ? (propOutdoorMode ?? false) : internalSunlightMode;

  // Merge prop design or ticket design with platform defaults
  const design: TicketDesignConfig = {
    ...DEFAULT_TICKET_DESIGN,
    ...(ticket.ticketDesign || {}),
    ...(propDesign || {}),
  };

  const isCheckedIn = ticket.status === "CHECKED_IN";
  const isRevoked = ticket.status === "REVOKED";
  const isValid = ticket.status === "ISSUED";

  const template = design.template || "classic";
  const bgStyle = design.backgroundStyle || "white";
  const primaryColor = design.primaryColor || "#171923";
  const accentColor = design.accentColor || "#059669";
  const isDark = bgStyle === "dark" && !sunlightMode;

  const handleCopyLink = () => {
    if (previewMode) return;
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(ticket.ticketUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (previewMode) return;
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Generate downloadable .ics calendar event
  const handleAddToCalendar = () => {
    if (previewMode || !ticket.eventDateStart) return;

    const startDate = new Date(ticket.eventDateStart);
    const endDate = ticket.eventDateEnd
      ? new Date(ticket.eventDateEnd)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const formatDateToICS = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d+/g, "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TicketKoi//EntrancePass//EN",
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

  // Dynamic card background classes
  const cardBgClasses = sunlightMode
    ? "bg-white border-2 border-black text-black shadow-none ring-4 ring-black/5"
    : bgStyle === "dark"
    ? "bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-xl"
    : bgStyle === "neutral"
    ? "bg-[#FAF8F5] border border-[#E7E2D8] text-zinc-900 shadow-sm"
    : "bg-white border border-zinc-200/90 text-zinc-900 shadow-sm";

  return (
    <div className={cn("w-full max-w-md mx-auto space-y-4", className)}>
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

      {/* Sunlight Contrast Mode Button for Outdoor Gate Scans (Attendee Pass only) */}
      {!previewMode && (
        <div className="no-print flex justify-end">
          <button
            type="button"
            onClick={() => setInternalSunlightMode(!internalSunlightMode)}
            className={cn(
              "text-xs px-3.5 py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-medium min-h-[44px]",
              internalSunlightMode
                ? "bg-amber-100 border-amber-300 text-amber-950 font-bold shadow-xs"
                : isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs"
            )}
            title={internalSunlightMode ? "Disable outdoor bright contrast mode" : "Enable outdoor bright contrast mode"}
            aria-label={internalSunlightMode ? "Disable outdoor bright contrast mode" : "Enable outdoor bright contrast mode"}
          >
            {internalSunlightMode ? (
              <Sun className="h-4 w-4 text-amber-600 shrink-0" />
            ) : (
              <SunMedium className="h-4 w-4 text-zinc-400 shrink-0" />
            )}
            <span>{internalSunlightMode ? "Outdoor High Contrast: ON" : "Outdoor Brightness Mode"}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE A: CLASSIC (Clean, balanced admission pass) */}
      {/* ========================================================================= */}
      {template === "classic" && (
        <div className={cn("ticket-card rounded-3xl overflow-hidden transition-all", cardBgClasses)}>
          {/* Top Header Segment */}
          <div
            className={cn(
              "p-6 pb-5 space-y-3 border-b",
              isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50/50 border-zinc-100"
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs uppercase tracking-wider font-bold flex items-center gap-1.5",
                  isDark ? "text-zinc-400" : "text-zinc-500"
                )}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: primaryColor }} />
                Verified Admission Pass
              </span>

              {/* Dynamic Status Badge */}
              {isValid && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active • Admissible
                </span>
              )}
              {isCheckedIn && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-zinc-500" />
                  Checked In
                </span>
              )}
              {isRevoked && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  Revoked
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
                  style={{ color: isDark ? "#F4F4F5" : primaryColor }}
                >
                  {ticket.eventName}
                </h1>
                {design.logoUrl && (
                  <div className="shrink-0 p-1 bg-white rounded-xl border border-zinc-200/80 shadow-2xs">
                    <img
                      src={design.logoUrl}
                      alt={`${ticket.organizationName} logo`}
                      className="h-10 w-auto max-w-[90px] object-contain"
                    />
                  </div>
                )}
              </div>

              {design.showOrganizationName && (
                <p className={cn("text-sm flex items-center gap-1.5 font-medium", isDark ? "text-zinc-400" : "text-zinc-600")}>
                  <Building className="h-4 w-4 text-zinc-400 shrink-0" />
                  {ticket.organizationName}
                </p>
              )}
            </div>
          </div>

          {/* Perforated Divider Strip with Side Notches */}
          <div
            className={cn(
              "relative py-2.5 border-y border-dashed",
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-zinc-50/80 border-zinc-200"
            )}
          >
            <div
              className={cn(
                "absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-r",
                isDark ? "bg-[#09090b] border-zinc-800" : "bg-[#fbfbf9] border-zinc-200/90"
              )}
            />
            <div
              className={cn(
                "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-l",
                isDark ? "bg-[#09090b] border-zinc-800" : "bg-[#fbfbf9] border-zinc-200/90"
              )}
            />
            <div className="text-center">
              <span className={cn("text-xs uppercase tracking-widest font-semibold font-mono", isDark ? "text-zinc-400" : "text-zinc-500")}>
                Scan Gate Entrance Token
              </span>
            </div>
          </div>

          {/* QR Code Presentation Segment */}
          <div className="p-6 text-center space-y-5">
            {/* QR Code Box (Always High-Contrast White for reliable hardware scanning) */}
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

              {isRevoked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-rose-600/90 text-white font-mono font-bold text-xs uppercase px-4 py-1.5 rounded-full shadow-lg border border-white tracking-widest -rotate-12">
                    Pass Revoked
                  </div>
                </div>
              )}
            </div>

            {/* Ticket Number & Category */}
            <div className="space-y-1.5">
              <p
                className="font-mono text-xl font-bold tracking-wider"
                style={{ color: isDark ? "#FAFAFA" : primaryColor }}
              >
                #{ticket.ticketNumber}
              </p>
              {design.showCategoryBadge && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    color: accentColor,
                    borderColor: `${accentColor}35`,
                  }}
                >
                  <TicketIcon className="h-3.5 w-3.5" />
                  {design.customBadgeText || ticket.category}
                </div>
              )}
            </div>

            {/* Alert Status Banners */}
            {isCheckedIn && (
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-sm text-emerald-900 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Admitted at gate turnstile{" "}
                  {ticket.checkedInAt ? format(new Date(ticket.checkedInAt), "MMM d, h:mm a") : ""}
                </span>
              </div>
            )}

            {isRevoked && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 flex items-center justify-center gap-2 font-medium">
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>This entrance pass has been revoked by the organizer.</span>
              </div>
            )}

            {/* Attendee Details Grid */}
            <div
              className={cn(
                "pt-4 border-t text-left space-y-2.5 text-sm",
                isDark ? "border-zinc-800" : "border-zinc-100"
              )}
            >
              <div className={cn("flex justify-between items-center py-1.5 border-b", isDark ? "border-zinc-800/80 text-zinc-300" : "border-zinc-100/60 text-zinc-900")}>
                <span className={cn("font-medium flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <User className="h-4 w-4 text-zinc-400" /> Attendee
                </span>
                <span className="font-semibold">{ticket.participantName}</span>
              </div>

              {ticket.participantEmailMasked && (
                <div className={cn("flex justify-between items-center py-1.5 border-b", isDark ? "border-zinc-800/80 text-zinc-300" : "border-zinc-100/60 text-zinc-700")}>
                  <span className={cn("font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Registered Account</span>
                  <span className="font-mono font-medium text-xs">{ticket.participantEmailMasked}</span>
                </div>
              )}

              {ticket.eventDateStart && (
                <div className={cn("flex justify-between items-center py-1.5 border-b", isDark ? "border-zinc-800/80 text-zinc-300" : "border-zinc-100/60 text-zinc-800")}>
                  <span className={cn("font-medium flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                    <Calendar className="h-4 w-4 text-zinc-400" /> Date & Time
                  </span>
                  <span className="font-semibold">
                    {format(new Date(ticket.eventDateStart), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
              )}

              {ticket.eventLocation && (
                <div className="flex justify-between items-center py-1.5">
                  <span className={cn("font-medium flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                    <MapPin className="h-4 w-4 text-zinc-400" /> Location
                  </span>
                  <span className={cn("font-medium text-right max-w-[220px] truncate", isDark ? "text-zinc-300" : "text-zinc-800")}>
                    {ticket.eventLocation}
                  </span>
                </div>
              )}
            </div>

            <p className={cn("text-xs pt-1 leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-500")}>
              Please present this digital entrance pass on your mobile device or printed copy at the event gate scanner.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE B: EDITORIAL (Bold, typographic, stylized accent ribbon) */}
      {/* ========================================================================= */}
      {template === "editorial" && (
        <div className={cn("ticket-card rounded-3xl overflow-hidden transition-all", cardBgClasses)}>
          {/* Top Decorative Accent Strip */}
          <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

          <div className="p-6 space-y-4">
            {/* Header with Title & Logo */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-200/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    Official Pass
                  </span>
                  {design.showCategoryBadge && (
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {design.customBadgeText || ticket.category}
                    </span>
                  )}
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-1 leading-tight"
                  style={{ color: isDark ? "#FAFAFA" : primaryColor }}
                >
                  {ticket.eventName}
                </h1>

                {design.showOrganizationName && (
                  <p className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-zinc-400" : "text-zinc-500")}>
                    Hosted by {ticket.organizationName}
                  </p>
                )}
              </div>

              {design.logoUrl && (
                <div className="shrink-0 p-1.5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs">
                  <img
                    src={design.logoUrl}
                    alt={`${ticket.organizationName} logo`}
                    className="h-12 w-auto max-w-[100px] object-contain"
                  />
                </div>
              )}
            </div>

            {/* Split Schedule & Venue Highlight */}
            <div className={cn("grid grid-cols-2 gap-3 p-3.5 rounded-2xl border text-xs", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200/80")}>
              <div>
                <span className={cn("font-medium flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <Calendar className="h-3.5 w-3.5" style={{ color: accentColor }} /> Schedule
                </span>
                <p className="font-bold mt-1 text-sm">
                  {ticket.eventDateStart
                    ? format(new Date(ticket.eventDateStart), "MMM d, yyyy")
                    : "Date TBA"}
                </p>
                <p className={cn("text-[11px]", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  {ticket.eventDateStart ? format(new Date(ticket.eventDateStart), "h:mm a") : ""}
                </p>
              </div>

              <div>
                <span className={cn("font-medium flex items-center gap-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  <MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} /> Venue
                </span>
                <p className="font-bold mt-1 text-sm truncate">
                  {ticket.eventLocation ? ticket.eventLocation.split(",")[0] : "Venue TBA"}
                </p>
                <p className={cn("text-[11px] truncate", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  {ticket.eventLocation || "Gate Entry"}
                </p>
              </div>
            </div>

            {/* QR Scanner Presentation */}
            <div className="py-2 text-center space-y-3">
              <div className="inline-block p-4 bg-white rounded-3xl border-2 border-zinc-200 shadow-sm relative">
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR code for ticket ${ticket.ticketNumber}`}
                  className="w-44 h-44 object-contain mx-auto"
                />
                {isRevoked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-950/70 rounded-3xl">
                    <span className="text-white font-mono font-bold text-xs uppercase px-3 py-1 bg-rose-600 rounded-full">
                      Revoked
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono font-medium block">
                  Turnstile Reference
                </span>
                <p className="font-mono text-xl font-bold tracking-widest" style={{ color: primaryColor }}>
                  #{ticket.ticketNumber}
                </p>
              </div>
            </div>

            {/* Attendee Credential Footer */}
            <div className={cn("p-4 rounded-2xl border flex items-center justify-between text-xs", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200/80")}>
              <div>
                <span className={cn("block text-[11px] font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  Ticket Holder
                </span>
                <span className="font-bold text-sm block">{ticket.participantName}</span>
                {ticket.participantEmailMasked && (
                  <span className="text-[11px] font-mono text-zinc-400">{ticket.participantEmailMasked}</span>
                )}
              </div>

              <div className="text-right">
                {isCheckedIn ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-200 text-zinc-800 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Admitted
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                      borderColor: `${accentColor}30`,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                    Valid Gate Pass
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE C: BRAND FORWARD (Prominent logo hero block with color header) */}
      {/* ========================================================================= */}
      {template === "brand_forward" && (
        <div className={cn("ticket-card rounded-3xl overflow-hidden transition-all shadow-md", cardBgClasses)}>
          {/* Branded Hero Header */}
          <div
            className="p-6 text-white text-center space-y-3 relative"
            style={{ backgroundColor: primaryColor }}
          >
            {design.logoUrl ? (
              <div className="mx-auto inline-block p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
                <img
                  src={design.logoUrl}
                  alt={`${ticket.organizationName} logo`}
                  className="h-12 w-auto max-w-[130px] object-contain mx-auto filter drop-shadow-sm"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto text-white">
                <Building className="h-6 w-6" />
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {ticket.eventName}
              </h1>
              {design.showOrganizationName && (
                <p className="text-xs text-white/80 font-medium">
                  {ticket.organizationName}
                </p>
              )}
            </div>

            {/* Category Ribbon */}
            {design.showCategoryBadge && (
              <div className="pt-1">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {design.customBadgeText || ticket.category}
                </span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 text-center space-y-5">
            {/* Elevated QR Card */}
            <div className="relative inline-block -mt-10">
              <div className="p-4 bg-white rounded-3xl border-2 border-zinc-200 shadow-lg">
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR code for ticket ${ticket.ticketNumber}`}
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>
            </div>

            <div>
              <p className="font-mono text-2xl font-black tracking-wider" style={{ color: primaryColor }}>
                #{ticket.ticketNumber}
              </p>
              <p className={cn("text-xs font-medium mt-0.5", isDark ? "text-zinc-400" : "text-zinc-500")}>
                Admit One • Present for Turnstile Scanning
              </p>
            </div>

            {/* Attendee Details Card */}
            <div className={cn("p-4 rounded-2xl border text-left space-y-2 text-xs", isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200/80")}>
              <div className="flex justify-between items-center py-1 border-b border-zinc-200/60">
                <span className={cn("font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Attendee Name</span>
                <span className="font-bold text-sm">{ticket.participantName}</span>
              </div>

              {ticket.eventDateStart && (
                <div className="flex justify-between items-center py-1 border-b border-zinc-200/60">
                  <span className={cn("font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Event Schedule</span>
                  <span className="font-semibold">
                    {format(new Date(ticket.eventDateStart), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
              )}

              {ticket.eventLocation && (
                <div className="flex justify-between items-center py-1">
                  <span className={cn("font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Event Venue</span>
                  <span className="font-medium text-right truncate max-w-[200px]">
                    {ticket.eventLocation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE D: MINIMAL (Compact, restrained, essential focus) */}
      {/* ========================================================================= */}
      {template === "minimal" && (
        <div className={cn("ticket-card rounded-2xl p-6 space-y-5 transition-all", cardBgClasses)}>
          {/* Minimal Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200/70">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Admission Pass
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
                {ticket.eventName}
              </h1>
              {design.showOrganizationName && (
                <p className="text-xs text-zinc-500 font-medium">{ticket.organizationName}</p>
              )}
            </div>

            {design.logoUrl && (
              <img
                src={design.logoUrl}
                alt={`${ticket.organizationName} logo`}
                className="h-9 w-auto max-w-[70px] object-contain rounded-lg shrink-0"
              />
            )}
          </div>

          {/* Minimal QR Area */}
          <div className="p-4 bg-white rounded-2xl border border-zinc-200/90 text-center space-y-2">
            <img
              src={ticket.qrCodeDataUrl}
              alt={`QR code for ticket ${ticket.ticketNumber}`}
              className="w-40 h-40 object-contain mx-auto"
            />
            <p className="font-mono text-sm font-bold text-zinc-900 tracking-wider">
              #{ticket.ticketNumber}
            </p>
          </div>

          {/* Key Facts in Compact Hairline Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-zinc-200/70">
            <div>
              <span className="text-zinc-400 font-medium block">Attendee</span>
              <span className="font-bold text-zinc-800 text-sm">{ticket.participantName}</span>
            </div>

            <div className="text-right">
              <span className="text-zinc-400 font-medium block">Category</span>
              <span className="font-bold text-sm" style={{ color: accentColor }}>
                {design.customBadgeText || ticket.category}
              </span>
            </div>

            {ticket.eventDateStart && (
              <div className="col-span-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-zinc-700">
                <span className="text-zinc-400 font-medium">When & Where</span>
                <span className="font-medium text-right truncate max-w-[240px]">
                  {format(new Date(ticket.eventDateStart), "MMM d")} · {ticket.eventLocation || "Venue"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Utility Buttons (Hidden when printing or in studio preview mode) */}
      {!previewMode && (
        <div className="no-print space-y-2 pt-2">
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

          <p className="text-center text-xs font-mono text-zinc-400 pt-1">
            TicketKoi • Cryptographic Token Hash Protocol
          </p>
        </div>
      )}
    </div>
  );
}
