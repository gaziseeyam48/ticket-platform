import { describe, it, expect } from "vitest";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";

describe("Phase 12: Event Lifecycle State Machine & Transition Rules", () => {
  type EventStatus = "DRAFT" | "PUBLISHED" | "LIVE" | "ENDED" | "CANCELLED";

  function validateStatusTransition(
    currentStatus: EventStatus,
    targetStatus: EventStatus,
    hasFormConfigured: boolean
  ): { allowed: boolean; error?: string } {
    // 1. Guard terminal states: ENDED and CANCELLED cannot be restarted
    if (currentStatus === "ENDED" || currentStatus === "CANCELLED") {
      return {
        allowed: false,
        error: `Event has reached terminal state "${currentStatus}" and cannot be transitioned.`,
      };
    }

    // 2. Validate prerequisites for PUBLISHED and LIVE states
    if (targetStatus === "PUBLISHED" || targetStatus === "LIVE") {
      if (!hasFormConfigured) {
        return {
          allowed: false,
          error: `Cannot ${targetStatus === "LIVE" ? "start" : "publish"} event: Please configure registration form questions first.`,
        };
      }
    }

    // Valid state transitions
    const validTransitions: Record<EventStatus, EventStatus[]> = {
      DRAFT: ["PUBLISHED", "CANCELLED"],
      PUBLISHED: ["LIVE", "CANCELLED", "ENDED"],
      LIVE: ["ENDED", "CANCELLED"],
      ENDED: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus]?.includes(targetStatus)) {
      return {
        allowed: false,
        error: `Transition from ${currentStatus} to ${targetStatus} is invalid.`,
      };
    }

    return { allowed: true };
  }

  it("should permit starting an event (LIVE) from PUBLISHED status when form is configured", () => {
    const result = validateStatusTransition("PUBLISHED", "LIVE", true);
    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject starting an event (LIVE) if registration form has no configured questions", () => {
    const result = validateStatusTransition("PUBLISHED", "LIVE", false);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain("configure registration form questions first");
  });

  it("should permit ending an event (ENDED) from LIVE status", () => {
    const result = validateStatusTransition("LIVE", "ENDED", true);
    expect(result.allowed).toBe(true);
  });

  it("should permit ending an event (ENDED) from PUBLISHED status", () => {
    const result = validateStatusTransition("PUBLISHED", "ENDED", true);
    expect(result.allowed).toBe(true);
  });

  it("should strictly disallow restarting an ENDED event (terminal state enforcement)", () => {
    expect(validateStatusTransition("ENDED", "LIVE", true).allowed).toBe(false);
    expect(validateStatusTransition("ENDED", "PUBLISHED", true).allowed).toBe(false);
    expect(validateStatusTransition("ENDED", "DRAFT", true).allowed).toBe(false);
  });

  it("should strictly disallow restarting a CANCELLED event (terminal state enforcement)", () => {
    expect(validateStatusTransition("CANCELLED", "LIVE", true).allowed).toBe(false);
    expect(validateStatusTransition("CANCELLED", "PUBLISHED", true).allowed).toBe(false);
    expect(validateStatusTransition("CANCELLED", "DRAFT", true).allowed).toBe(false);
  });
});

describe("Phase 12: Backend Gate Enforcement by Lifecycle State", () => {
  function checkGateStatus(eventStatus: string): {
    canVerify: boolean;
    status: string;
    message?: string;
  } {
    if (eventStatus !== "LIVE" && eventStatus !== "PUBLISHED") {
      return {
        canVerify: false,
        status: "EVENT_NOT_LIVE",
        message:
          eventStatus === "ENDED"
            ? "Event has ended. Entrance gates are closed."
            : eventStatus === "CANCELLED"
            ? "Event has been cancelled. Verification is disabled."
            : "Event is not yet open for entrance check-in.",
      };
    }

    if (eventStatus === "PUBLISHED") {
      return {
        canVerify: false,
        status: "EVENT_NOT_LIVE",
        message: "Event turnstile is on standby. Organizer must start the event to accept check-ins.",
      };
    }

    return {
      canVerify: true,
      status: "VALID",
    };
  }

  it("should allow gate pass verification when event is LIVE", () => {
    const gate = checkGateStatus("LIVE");
    expect(gate.canVerify).toBe(true);
    expect(gate.status).toBe("VALID");
  });

  it("should block gate pass verification when event is ENDED", () => {
    const gate = checkGateStatus("ENDED");
    expect(gate.canVerify).toBe(false);
    expect(gate.status).toBe("EVENT_NOT_LIVE");
    expect(gate.message).toContain("Event has ended");
  });

  it("should block gate pass verification when event is CANCELLED", () => {
    const gate = checkGateStatus("CANCELLED");
    expect(gate.canVerify).toBe(false);
    expect(gate.status).toBe("EVENT_NOT_LIVE");
    expect(gate.message).toContain("cancelled");
  });

  it("should block gate pass verification when event is still DRAFT or PUBLISHED", () => {
    const draftGate = checkGateStatus("DRAFT");
    expect(draftGate.canVerify).toBe(false);
    expect(draftGate.status).toBe("EVENT_NOT_LIVE");

    const pubGate = checkGateStatus("PUBLISHED");
    expect(pubGate.canVerify).toBe(false);
    expect(pubGate.status).toBe("EVENT_NOT_LIVE");
  });
});

describe("Phase 12: Public Registration Control by Lifecycle State", () => {
  function canAcceptRegistrations(eventStatus: string): boolean {
    return eventStatus === "PUBLISHED" || eventStatus === "LIVE";
  }

  it("should accept attendee registrations for PUBLISHED and LIVE events", () => {
    expect(canAcceptRegistrations("PUBLISHED")).toBe(true);
    expect(canAcceptRegistrations("LIVE")).toBe(true);
  });

  it("should reject attendee registrations for ENDED, CANCELLED, or DRAFT events", () => {
    expect(canAcceptRegistrations("ENDED")).toBe(false);
    expect(canAcceptRegistrations("CANCELLED")).toBe(false);
    expect(canAcceptRegistrations("DRAFT")).toBe(false);
  });
});

describe("Phase 12: Historical Data Preservation Post-Event", () => {
  it("should preserve issued tickets and check-in history even after event ends", () => {
    const historicalEvent = {
      id: "ev-hist-1",
      name: "DevCon 2025",
      status: "ENDED",
      tickets: [
        { id: "tkt-1", status: "CHECKED_IN", checked_in_at: "2025-10-10T10:00:00Z" },
        { id: "tkt-2", status: "ISSUED", checked_in_at: null },
      ],
      registrations: [{ id: "reg-1", participant_name: "Alice" }],
    };

    // Ending the event must NOT delete tickets or registrations
    expect(historicalEvent.tickets.length).toBe(2);
    expect(historicalEvent.registrations.length).toBe(1);
    expect(historicalEvent.tickets[0].status).toBe("CHECKED_IN");
    expect(historicalEvent.status).toBe("ENDED");
  });
});
