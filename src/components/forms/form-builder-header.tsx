"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface FormBuilderHeaderProps {
  eventId: string;
  eventName: string;
  eventSlug: string;
  hasUnsavedChanges: boolean;
  saveStatus: SaveStatus;
  saveErrorMessage?: string;
  onSave: () => void;
  onOpenPreview: () => void;
}

export function FormBuilderHeader({
  eventId,
  eventName,
  eventSlug,
  hasUnsavedChanges,
  saveStatus,
  saveErrorMessage,
  onSave,
  onOpenPreview,
}: FormBuilderHeaderProps) {
  return (
    <header className="space-y-3 pb-5 border-b border-zinc-200">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link
          href="/org/events"
          className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          Events
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" aria-hidden="true" />
        <Link
          href={`/org/events/${eventId}`}
          className="hover:text-zinc-900 transition-colors truncate max-w-[200px] focus-visible:outline-none focus-visible:underline"
          title={eventName}
        >
          {eventName}
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" aria-hidden="true" />
        <span className="font-medium text-zinc-900" aria-current="page">
          Registration Form
        </span>
      </nav>

      {/* Main Title Bar & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Registration form
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Choose what information to collect from attendees.
          </p>
        </div>

        {/* Header Actions Area */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Status feedback indicator */}
          <div
            className="flex items-center text-xs font-medium"
            role="status"
            aria-live="polite"
          >
            {saveStatus === "saving" && (
              <span className="flex items-center gap-2 text-zinc-600">
                <span className="h-3.5 w-3.5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                Saving…
              </span>
            )}

            {saveStatus === "saved" && !hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                Saved
              </span>
            )}

            {saveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                Save failed
              </span>
            )}

            {hasUnsavedChanges && saveStatus !== "saving" && saveStatus !== "error" && (
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                Unsaved changes
              </span>
            )}
          </div>

          {/* Secondary Action: Preview Public Form */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenPreview}
            className="gap-1.5 text-xs h-9 px-3"
            aria-label="Preview public form"
          >
            <Eye className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            Preview public form
          </Button>

          {/* Primary Action: Save changes (or Retry on failure) */}
          {saveStatus === "error" ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onSave}
              className="gap-1.5 text-xs h-9 px-3"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry Save
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={saveStatus === "saving" || !hasUnsavedChanges}
              onClick={onSave}
              isLoading={saveStatus === "saving"}
              className="text-xs font-semibold h-9 px-4"
              aria-label="Save changes to registration form"
            >
              Save changes
            </Button>
          )}
        </div>
      </div>

      {/* Error alert banner if save failed */}
      {saveStatus === "error" && saveErrorMessage && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-semibold">Unable to save changes: </span>
            <span>{saveErrorMessage}</span>
          </div>
        </div>
      )}
    </header>
  );
}
