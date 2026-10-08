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
        <div className="p-3 text-sm font-medium rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {error}
        </div>
      )}
      
      <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p className="text-sm text-zinc-400">Current state: <span className="text-zinc-100 font-medium">{currentStatus}</span></p>
        
        {transitions.length > 0 ? (
          <div className="flex flex-col gap-2 mt-4">
            {transitions.map((transition) => (
              <Button
                key={transition.status}
                variant={transition.variant}
                className="w-full"
                onClick={() => handleStatusChange(transition.status)}
                isLoading={isLoading}
              >
                {transition.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 mt-2">No further state transitions available.</p>
        )}
      </div>
    </div>
  );
}
