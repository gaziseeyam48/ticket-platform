"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateEventStatus } from "@/app/actions/event.actions";

interface EventStatusManagerProps {
  eventId: string;
  currentStatus: string;
}

export function EventStatusManager({ eventId, currentStatus }: EventStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    setError("");
    try {
      await updateEventStatus(eventId, newStatus);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableTransitions = () => {
    switch (currentStatus) {
      case "DRAFT":
        return [{ label: "Publish Event", status: "PUBLISHED", variant: "primary" as const }];
      case "PUBLISHED":
        return [
          { label: "Start Event (Go Live)", status: "LIVE", variant: "primary" as const },
          { label: "Cancel Event", status: "CANCELLED", variant: "danger" as const },
        ];
      case "LIVE":
        return [{ label: "End Event", status: "ENDED", variant: "secondary" as const }];
      case "ENDED":
      case "CANCELLED":
        return [];
      default:
        return [];
    }
  };

  const transitions = getAvailableTransitions();

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}
      
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
          Current State: <span className="text-zinc-900 font-bold ml-1">{currentStatus}</span>
        </p>
        
        {transitions.length > 0 ? (
          <div className="flex flex-col gap-2 mt-3">
            {transitions.map((transition) => (
              <Button
                key={transition.status}
                variant={transition.variant}
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={() => handleStatusChange(transition.status)}
                isLoading={isLoading}
              >
                {transition.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 mt-2 font-mono">No further state transitions available.</p>
        )}
      </div>
    </div>
  );
}
