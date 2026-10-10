"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/ui/modal";
import { updateEventStatus } from "@/app/actions/event.actions";
import {
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle,
  XCircle,
  QrCode,
  FileText,
  Radio,
} from "lucide-react";
import Link from "next/link";

interface EventLifecyclePanelProps {
  eventId: string;
  currentStatus: string;
  hasConfiguredForm?: boolean;
  formFieldsCount?: number;
  onStatusChange?: (newStatus: string) => void;
}

export function EventLifecyclePanel({
  eventId,
  currentStatus,
  hasConfiguredForm = true,
  formFieldsCount = 0,
  onStatusChange,
}: EventLifecyclePanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    targetStatus: string;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "warning";
  }>({
    isOpen: false,
    targetStatus: "",
    title: "",
    message: "",
    confirmLabel: "",
    variant: "warning",
  });

  const handleExecuteStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    setError("");
    try {
      await updateEventStatus(eventId, newStatus);
      if (onStatusChange) onStatusChange(newStatus);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      setError(err.message || "Failed to update lifecycle status.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestTransition = (targetStatus: string) => {
    setError("");
    if (targetStatus === "CANCELLED") {
      setConfirmModal({
        isOpen: true,
        targetStatus: "CANCELLED",
        title: "Cancel This Event?",
        message:
          "Cancelling will immediately stop participant registrations, void all existing entrance tickets, and mark the event as inactive. This action cannot be undone.",
        confirmLabel: "Yes, Cancel Event",
        variant: "danger",
      });
      return;
    }

    if (targetStatus === "ENDED") {
      setConfirmModal({
        isOpen: true,
        targetStatus: "ENDED",
        title: "End This Event?",
        message:
          "Ending the event will close entrance gate verification. Attendees will no longer be permitted entry through turnstile scanners.",
        confirmLabel: "End Event & Close Gates",
        variant: "warning",
      });
      return;
    }

    // Direct transition for Publish and Live
    handleExecuteStatusChange(targetStatus);
  };

  const getStatusExplanation = () => {
    switch (currentStatus) {
      case "DRAFT":
        return {
          title: "Draft Mode",
          description:
            "This event is private. Attendee registration is closed. Configure your registration questions and publish when you are ready to accept guests.",
          alert: !hasConfiguredForm ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration form required</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You must configure at least one question in the form builder before publishing.
                </p>
                <Link
                  href={`/org/events/${eventId}/form`}
                  className="inline-flex items-center gap-1 font-semibold text-amber-900 underline mt-1.5 hover:text-amber-950"
                >
                  <FileText className="h-3 w-3" />
                  Configure Form Questions
                </Link>
              </div>
            </div>
          ) : null,
        };
      case "PUBLISHED":
        return {
          title: "Public Registration Open",
          description:
            "Your event is public. Attendees can complete registration and receive digital entrance tickets. When ready on event day, start the event to open entrance gates.",
          alert: null,
        };
      case "LIVE":
        return {
          title: "Event Is Live",
          description:
            "The event is currently underway. Entrance gates and QR verification scanners are active for attendee check-in.",
          alert: null,
        };
      case "ENDED":
        return {
          title: "Event Concluded",
          description:
            "This event has officially ended. Entrance gate verification is closed and no further check-ins are permitted.",
          alert: null,
        };
      case "CANCELLED":
        return {
          title: "Event Cancelled",
          description:
            "This event has been cancelled. Public registration is offline and all issued entrance passes are void.",
          alert: null,
        };
      default:
        return {
          title: currentStatus,
          description: "Lifecycle status tracked.",
          alert: null,
        };
    }
  };

  const statusInfo = getStatusExplanation();

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-xs font-medium rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Status Explanatory Card */}
      <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-zinc-500" />
            Current Lifecycle State
          </span>
          <StatusBadge status={currentStatus} />
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          {statusInfo.description}
        </p>

        {statusInfo.alert}
      </div>

      {/* Action Controls by State */}
      <div className="space-y-2">
        {currentStatus === "DRAFT" && (
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs font-semibold gap-1.5 shadow-xs"
            onClick={() => requestTransition("PUBLISHED")}
            isLoading={isLoading}
            disabled={!hasConfiguredForm || isLoading}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Publish Event (Open Registration)
          </Button>
        )}

        {currentStatus === "PUBLISHED" && (
          <div className="space-y-2">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              onClick={() => requestTransition("LIVE")}
              isLoading={isLoading}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Event (Go Live)
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200/80 shadow-2xs"
              onClick={() => requestTransition("CANCELLED")}
              disabled={isLoading}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel Event
            </Button>
          </div>
        )}

        {currentStatus === "LIVE" && (
          <div className="space-y-2">
            <Link href={`/verify?event_id=${eventId}`} className="block">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <QrCode className="h-3.5 w-3.5" />
                Open Entrance Scanner
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200/80 shadow-2xs"
              onClick={() => requestTransition("ENDED")}
              disabled={isLoading}
            >
              End Event & Close Gates
            </Button>
          </div>
        )}

        {(currentStatus === "ENDED" || currentStatus === "CANCELLED") && (
          <div className="p-3 rounded-lg bg-zinc-100 text-zinc-500 text-xs text-center font-medium">
            Terminal state reached · No further transitions
          </div>
        )}
      </div>

      {/* Confirmation Modal for Destructive Transitions */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 leading-relaxed">
            {confirmModal.message}
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-medium"
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={isLoading}
            >
              Keep Event
            </Button>
            <Button
              type="button"
              variant={confirmModal.variant === "danger" ? "danger" : "secondary"}
              size="sm"
              className="text-xs font-semibold"
              onClick={() => handleExecuteStatusChange(confirmModal.targetStatus)}
              isLoading={isLoading}
            >
              {confirmModal.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
