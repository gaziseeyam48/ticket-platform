"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Upload,
  Trash2,
  AlertTriangle,
  Smartphone,
  Maximize2,
  Sun,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TicketPassView, TicketPassData } from "@/components/ticket/ticket-pass-view";
import {
  TicketDesignConfig,
  TicketTemplateId,
  TicketBackgroundStyle,
  COLOR_THEME_PRESETS,
  DEFAULT_TICKET_DESIGN,
  getContrastRatio,
} from "@/lib/types/ticket-design";
import {
  saveTicketDesign,
  resetTicketDesign,
  uploadTicketLogo,
} from "@/app/actions/ticket-design.actions";

interface TicketDesignStudioProps {
  eventId: string;
  initialDesign: TicketDesignConfig;
  event: {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
    date_start?: string | null;
    date_end?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    location?: string | null;
  };
  organization: {
    id: string;
    name: string;
  };
  sampleQrCode?: string;
}

/**
 * Visual thumbnail wireframes representing genuine ticket compositions.
 */
function TemplateThumbnail({ templateId }: { templateId: TicketTemplateId }) {
  if (templateId === "classic") {
    return (
      <div className="w-full h-20 rounded-lg bg-white border border-zinc-200 overflow-hidden flex flex-col p-2 select-none pointer-events-none shadow-2xs">
        <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
          <div className="h-1.5 w-10 bg-zinc-800 rounded-full" />
          <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
        </div>
        <div className="relative my-1 flex items-center justify-center">
          <div className="w-full border-t border-dashed border-zinc-300" />
          <span className="absolute text-[6px] text-zinc-400 font-mono tracking-wider bg-white px-1">GATE</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center p-0.5">
            <div className="w-5 h-5 border border-white rounded-[1px] grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-white rounded-[1px]" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-white/40 rounded-[1px]" />
            </div>
          </div>
          <div className="h-1 w-8 bg-zinc-300 rounded-full mt-1" />
        </div>
      </div>
    );
  }

  if (templateId === "editorial") {
    return (
      <div className="w-full h-20 rounded-lg bg-white border border-zinc-200 overflow-hidden flex flex-col select-none pointer-events-none shadow-2xs">
        <div className="h-1.5 w-full bg-indigo-600" />
        <div className="p-2 flex-1 flex flex-col justify-between">
          <div>
            <div className="h-2 w-14 bg-zinc-900 rounded-xs mb-1" />
            <div className="h-1 w-8 bg-zinc-400 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
            <div className="space-y-0.5">
              <div className="h-1 w-7 bg-zinc-400 rounded-full" />
              <div className="h-1 w-10 bg-zinc-300 rounded-full" />
            </div>
            <div className="w-6 h-6 rounded border border-zinc-300 bg-zinc-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-zinc-800 rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "brand_forward") {
    return (
      <div className="w-full h-20 rounded-lg bg-white border border-zinc-200 overflow-hidden flex flex-col select-none pointer-events-none shadow-2xs">
        <div className="h-7 w-full bg-zinc-900 p-1 flex items-center justify-between">
          <div className="w-3.5 h-3.5 rounded bg-white/90 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          </div>
          <div className="h-1 w-8 bg-white/70 rounded-full" />
        </div>
        <div className="p-1.5 flex-1 flex flex-col items-center justify-center">
          <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center p-0.5">
            <div className="w-4 h-4 border border-white grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-white rounded-[1px]" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-white/40 rounded-[1px]" />
              <div className="bg-white rounded-[1px]" />
            </div>
          </div>
          <div className="h-1 w-10 bg-zinc-300 rounded-full mt-1" />
        </div>
      </div>
    );
  }

  // minimal
  return (
    <div className="w-full h-20 rounded-lg bg-white border border-zinc-200 overflow-hidden flex flex-col p-2 justify-between select-none pointer-events-none shadow-2xs">
      <div>
        <div className="h-1.5 w-12 bg-zinc-900 rounded-full mb-1" />
        <div className="h-1 w-7 bg-zinc-400 rounded-full" />
      </div>
      <div className="border-t border-zinc-100 my-0.5" />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="h-1 w-9 bg-zinc-300 rounded-full" />
          <div className="h-1 w-6 bg-zinc-300 rounded-full" />
        </div>
        <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center">
          <div className="w-3 h-3 bg-white/20 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_OPTIONS: Array<{
  id: TicketTemplateId;
  name: string;
  tagline: string;
}> = [
  { id: "classic", name: "Classic", tagline: "Clean & balanced" },
  { id: "editorial", name: "Editorial", tagline: "Bold typography" },
  { id: "brand_forward", name: "Brand Forward", tagline: "Hero branding" },
  { id: "minimal", name: "Minimal", tagline: "Sleek & essential" },
];

export function TicketDesignStudio({
  eventId,
  initialDesign,
  event,
  organization,
  sampleQrCode,
}: TicketDesignStudioProps) {
  // Working local design state
  const [design, setDesign] = useState<TicketDesignConfig>(initialDesign);
  const [savedBaseline, setSavedBaseline] = useState<TicketDesignConfig>(initialDesign);

  // Studio UI states
  const [activeMobileTab, setActiveMobileTab] = useState<"customize" | "preview">("customize");
  const [previewViewport, setPreviewViewport] = useState<"mobile" | "expanded">("mobile");
  const [isOutdoorMode, setIsOutdoorMode] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Disclosure states for clean progressive disclosure
  const [showCustomColors, setShowCustomColors] = useState(false);
  const [showAppearanceOptions, setShowAppearanceOptions] = useState(false);
  const [showDisplayDetails, setShowDisplayDetails] = useState(false);

  // Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save state
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving" | "error">("saved");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  // Determine dirty state
  const isDirty = JSON.stringify(design) !== JSON.stringify(savedBaseline);

  useEffect(() => {
    if (saveStatus !== "saving") {
      setSaveStatus(isDirty ? "unsaved" : "saved");
    }
  }, [isDirty, saveStatus]);

  // Warn before unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Contrast warning calculation
  const bgHex =
    design.backgroundStyle === "dark"
      ? "#0F172A"
      : design.backgroundStyle === "neutral"
      ? "#F4F4F5"
      : "#FFFFFF";
  const primaryContrast = getContrastRatio(design.primaryColor, bgHex);
  const showContrastWarning = primaryContrast < 3.0 && design.backgroundStyle === "white";

  // Handlers
  const handleTemplateSelect = (templateId: TicketTemplateId) => {
    setDesign((prev) => ({ ...prev, template: templateId }));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = COLOR_THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDesign((prev) => ({
      ...prev,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      backgroundStyle: preset.backgroundStyle,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploadError(null);

    // Validate SVG rejection explicitly
    if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
      setLogoUploadError(
        "SVG format is not supported for security reasons. Please upload PNG, JPEG, or WebP."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadError("Logo file must be under 2 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadTicketLogo(eventId, formData);

      if (res.success && res.logoUrl) {
        setDesign((prev) => ({ ...prev, logoUrl: res.logoUrl }));
      } else {
        setLogoUploadError((res as any).error || "Failed to upload logo.");
      }
    } catch (err: any) {
      setLogoUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setDesign((prev) => ({ ...prev, logoUrl: null }));
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setSaveErrorMessage(null);
    startSaveTransition(async () => {
      try {
        const result = await saveTicketDesign(eventId, design);
        if (result.success && result.design) {
          setSavedBaseline(result.design);
          setDesign(result.design);
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
          setSaveErrorMessage((result as any).error || "Failed to save design.");
        }
      } catch (err: any) {
        setSaveStatus("error");
        setSaveErrorMessage(err.message || "Network error. Please try again.");
      }
    });
  };

  const handleConfirmReset = () => {
    setIsResetModalOpen(false);
    setSaveStatus("saving");
    startSaveTransition(async () => {
      try {
        const result = await resetTicketDesign(eventId);
        if (result.success && result.design) {
          setSavedBaseline(result.design);
          setDesign(result.design);
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
          setSaveErrorMessage((result as any).error || "Failed to reset design.");
        }
      } catch (err: any) {
        setSaveStatus("error");
        setSaveErrorMessage(err.message || "Failed to reset design.");
      }
    });
  };

  // Sample Ticket Payload matching TicketPassData exactly
  const sampleTicket: TicketPassData = {
    ticketNumber: "TKT-CUR5WA",
    status: "ISSUED",
    participantName: "Seeyam",
    participantEmailMasked: "g**********8@gmail.com",
    category: "General Admission",
    issuedAt: "2026-10-17T18:00:00.000Z",
    checkedInAt: null,
    revokedAt: null,
    eventName: event.name || event.title || "FPS Film Screening",
    eventSlug: event.slug || "fps-film-screening",
    eventStatus: "PUBLISHED",
    eventDateStart: event.date_start || event.start_time || "2026-10-24T18:00:00.000Z",
    eventDateEnd:
      event.date_end ||
      event.end_time ||
      "2026-10-24T21:00:00.000Z",
    eventLocation: event.location || "AIBA CAMPUS",
    organizationName: organization.name || "Gazi Events Inc.",
    qrCodeDataUrl:
      sampleQrCode ||
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><rect x='10' y='10' width='30' height='30' fill='black'/><rect x='60' y='10' width='30' height='30' fill='black'/><rect x='10' y='60' width='30' height='30' fill='black'/></svg>",
    ticketUrl: "https://ticketkoi.com/t/sample",
    ticketDesign: design,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#171923]">
      {/* ========================================================================= */}
      {/* 1. COMPACT EDITOR HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/org/events/${eventId}`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#171923] hover:bg-[#F1F5F9] transition-colors shrink-0"
              title="Back to Event"
              aria-label="Back to Event"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold text-[#0F172A] tracking-tight truncate">
                  Customize ticket
                </h1>
                {/* Subtle unobtrusive save status */}
                <div className="hidden sm:inline-flex items-center gap-1.5 text-xs">
                  {saveStatus === "saved" && (
                    <span className="text-zinc-500 font-medium inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Saved
                    </span>
                  )}
                  {saveStatus === "unsaved" && (
                    <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Unsaved changes
                    </span>
                  )}
                  {saveStatus === "saving" && (
                    <span className="text-blue-700 font-medium inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span className="text-rose-700 font-medium inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Save failed
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#64748B] hidden sm:block">
                Make your event ticket your own.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-[#64748B] hover:text-[#0F172A] border-[#E2E8F0]"
              onClick={() => setIsResetModalOpen(true)}
              disabled={isSaving}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-semibold px-4 shadow-2xs"
              onClick={handleSave}
              disabled={isSaving || (!isDirty && saveStatus === "saved")}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : !isDirty && saveStatus === "saved" ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Saved
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Tab Segmented Control */}
        <div className="mt-2.5 flex lg:hidden border-t border-[#F1F5F9] pt-2">
          <div className="grid grid-cols-2 w-full p-0.5 bg-[#F1F5F9] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMobileTab("customize")}
              className={`py-1.5 rounded-lg text-center transition-all ${
                activeMobileTab === "customize"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B]"
              }`}
            >
              Customize
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab("preview")}
              className={`py-1.5 rounded-lg text-center transition-all ${
                activeMobileTab === "preview"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B]"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </header>

      {/* Save Error Notification Banner if any */}
      {saveErrorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{saveErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveErrorMessage(null)}
            className="text-rose-600 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: TWO-PANEL LAYOUT */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ===================================================================== */}
          {/* LEFT: CUSTOMIZATION PANEL (340-380px wide) */}
          {/* ===================================================================== */}
          <div
            className={`w-full lg:w-[360px] shrink-0 space-y-5 ${
              activeMobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* SECTION 1: STYLE */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Style
                  </h2>
                  <p className="text-xs text-zinc-700 font-medium">Choose ticket layout</p>
                </div>
              </div>

              {/* 4 Visual Thumbnails Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {TEMPLATE_OPTIONS.map((tmpl) => {
                  const isSelected = design.template === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleTemplateSelect(tmpl.id)}
                      className={`group relative flex flex-col p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-zinc-900 ring-2 ring-zinc-900/10 bg-zinc-50/60 shadow-2xs"
                          : "border-[#E2E8F0] hover:border-zinc-300 bg-white"
                      }`}
                    >
                      {/* Visual Ticket Wireframe Thumbnail */}
                      <TemplateThumbnail templateId={tmpl.id} />

                      {/* Clean Name & Subtitle */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900">
                          {tmpl.name}
                        </span>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 leading-tight">
                        {tmpl.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: BRANDING (Consolidated Logo + Colors) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Branding
                </h2>
                <p className="text-xs text-zinc-700 font-medium">Logo & color palette</p>
              </div>

              {/* Logo Management */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700 block">
                  Event Logo
                </label>

                {design.logoUrl ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                    <div className="h-10 w-16 relative rounded-lg border border-zinc-200 bg-white p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={design.logoUrl}
                        alt="Event Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-900 truncate">Custom logo</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Replace
                        </button>
                        <span className="text-zinc-300 text-xs">&bull;</span>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors cursor-pointer"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-zinc-500" />
                    )}
                    <span>{isUploadingLogo ? "Uploading logo..." : "Upload logo"}</span>
                    <span className="text-[11px] text-zinc-400 font-normal">
                      (PNG, JPG, WebP &bull; 2MB)
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                />

                {logoUploadError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {logoUploadError}
                  </p>
                )}
              </div>

              {/* Color Theme Palettes */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <label className="text-xs font-medium text-zinc-700 block">
                  Palette
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {COLOR_THEME_PRESETS.map((preset) => {
                    const isSelected =
                      design.primaryColor.toLowerCase() === preset.primaryColor.toLowerCase() &&
                      design.accentColor.toLowerCase() === preset.accentColor.toLowerCase() &&
                      design.backgroundStyle === preset.backgroundStyle;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50/80"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center -space-x-1 shrink-0">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: preset.primaryColor }}
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                        </div>
                        <span className="font-medium text-zinc-800 truncate text-[11px]">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Secondary: Custom Colors Disclosure */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomColors((prev) => !prev)}
                    className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1.5 py-1"
                  >
                    <Sliders className="h-3 w-3" />
                    <span>Custom colors</span>
                    {showCustomColors ? (
                      <ChevronUp className="h-3 w-3 ml-auto text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 ml-auto text-zinc-400" />
                    )}
                  </button>

                  {showCustomColors && (
                    <div className="mt-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Primary */}
                        <div>
                          <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                            Primary
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={design.primaryColor}
                              onChange={(e) =>
                                setDesign((prev) => ({ ...prev, primaryColor: e.target.value }))
                              }
                              className="h-7 w-7 rounded-md border border-zinc-300 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={design.primaryColor.toUpperCase()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.startsWith("#") && val.length <= 7) {
                                  setDesign((prev) => ({ ...prev, primaryColor: val }));
                                }
                              }}
                              className="w-full px-2 py-1 text-[11px] font-mono rounded-md border border-zinc-300 bg-white text-zinc-900"
                            />
                          </div>
                        </div>

                        {/* Accent */}
                        <div>
                          <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                            Accent
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={design.accentColor}
                              onChange={(e) =>
                                setDesign((prev) => ({ ...prev, accentColor: e.target.value }))
                              }
                              className="h-7 w-7 rounded-md border border-zinc-300 cursor-pointer p-0.5 bg-white"
                            />
                            <input
                              type="text"
                              value={design.accentColor.toUpperCase()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.startsWith("#") && val.length <= 7) {
                                  setDesign((prev) => ({ ...prev, accentColor: val }));
                                }
                              }}
                              className="w-full px-2 py-1 text-[11px] font-mono rounded-md border border-zinc-300 bg-white text-zinc-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contrast warning */}
                      {showContrastWarning && (
                        <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            Selected primary color may reduce text readability on light backgrounds.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Optional Appearance Disclosure (Background style) */}
                <div className="pt-1 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowAppearanceOptions((prev) => !prev)}
                    className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1.5 py-1 w-full"
                  >
                    <span>More appearance options</span>
                    {showAppearanceOptions ? (
                      <ChevronUp className="h-3 w-3 ml-auto text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 ml-auto text-zinc-400" />
                    )}
                  </button>

                  {showAppearanceOptions && (
                    <div className="mt-2.5 pt-1 space-y-2">
                      <label className="text-[11px] font-medium text-zinc-600 block">
                        Background Style
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { id: "white", label: "Clean White", bg: "#FFFFFF", border: "#E2E8F0" },
                            { id: "neutral", label: "Soft Neutral", bg: "#F4F4F5", border: "#E4E4E7" },
                            { id: "dark", label: "Midnight Dark", bg: "#0F172A", border: "#1E293B" },
                          ] as const
                        ).map((bgItem) => {
                          const isSelected = design.backgroundStyle === bgItem.id;
                          return (
                            <button
                              key={bgItem.id}
                              type="button"
                              onClick={() =>
                                setDesign((prev) => ({
                                  ...prev,
                                  backgroundStyle: bgItem.id as TicketBackgroundStyle,
                                }))
                              }
                              className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                                isSelected
                                  ? "border-zinc-900 bg-zinc-50 font-semibold"
                                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700"
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border shadow-2xs shrink-0"
                                style={{ backgroundColor: bgItem.bg, borderColor: bgItem.border }}
                              />
                              <span className="truncate">{bgItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: DISPLAY SETTINGS (Optional Details & Badging) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-3">
              <button
                type="button"
                onClick={() => setShowDisplayDetails((prev) => !prev)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Display Details
                  </h2>
                  <p className="text-xs text-zinc-700 font-medium">Badges & organization name</p>
                </div>
                {showDisplayDetails ? (
                  <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                )}
              </button>

              {showDisplayDetails && (
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-xs text-zinc-700">Show Organization Name</span>
                    <input
                      type="checkbox"
                      checked={design.showOrganizationName}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, showOrganizationName: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-xs text-zinc-700">Show Category Admission Badge</span>
                    <input
                      type="checkbox"
                      checked={design.showCategoryBadge}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, showCategoryBadge: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </label>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-600 block mb-1">
                      Custom Badge Label (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Pass, Official Ticket"
                      value={design.customBadgeText || ""}
                      onChange={(e) =>
                        setDesign((prev) => ({
                          ...prev,
                          customBadgeText: e.target.value.trim() ? e.target.value : null,
                        }))
                      }
                      maxLength={40}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT: LIVE PREVIEW CENTERPIECE */}
          {/* ===================================================================== */}
          <div
            className={`flex-1 w-full flex flex-col items-center lg:sticky lg:top-16 ${
              activeMobileTab === "customize" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Clean Preview Toolbar */}
            <div className="w-full max-w-lg flex items-center justify-between px-2 py-1.5 mb-3 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-zinc-800 text-xs">Live preview</span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">&bull; Updates instantly</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Outdoor Brightness Mode Toggle (Single unified control) */}
                <button
                  type="button"
                  onClick={() => setIsOutdoorMode((prev) => !prev)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    isOutdoorMode
                      ? "bg-amber-100 text-amber-950 border-amber-300 font-bold"
                      : "bg-white text-zinc-600 border-zinc-200 hover:text-zinc-900 shadow-2xs"
                  }`}
                  title="Test daylight high-contrast outdoor visibility"
                >
                  <Sun className="h-3 w-3 text-amber-600" />
                  <span>Outdoor</span>
                </button>

                {/* Viewport switch */}
                <div className="flex items-center p-0.5 bg-zinc-200/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("mobile")}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      previewViewport === "mobile"
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                    title="Mobile Pass View"
                    aria-label="Mobile Pass View"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("expanded")}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      previewViewport === "expanded"
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                    title="Expanded View"
                    aria-label="Expanded View"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Focused Preview Workspace Canvas */}
            <div
              className={`w-full transition-all duration-300 flex justify-center ${
                previewViewport === "mobile" ? "max-w-[420px]" : "max-w-[540px]"
              }`}
            >
              <div className="w-full p-3 sm:p-5 rounded-3xl bg-[#ECEEF2] border border-[#DCE1E8] shadow-inner flex flex-col items-center">
                <TicketPassView
                  ticket={sampleTicket}
                  design={design}
                  previewMode={true}
                  outdoorMode={isOutdoorMode}
                />

                {/* Subtle Tamper-Proof Security Assurance */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>Security QR token & barcodes remain 100% scannable across all styles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* CONFIRM RESET MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Ticket Design"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Are you sure you want to reset this event’s ticket design? This will restore the default
            Classic layout, clear any uploaded logo, and reset the colors to TicketKoi defaults.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReset}
              className="text-xs font-semibold"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
