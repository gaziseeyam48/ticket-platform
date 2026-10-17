import { describe, it, expect } from "vitest";
import {
  evaluatePublicationChecklist,
  getWorkspaceStatusConfig,
} from "@/components/events/workspace-status-config";

describe("Status-Driven Workspace Configuration & Logic", () => {
  const baseEvent = {
    id: "event-123",
    name: "Tech Summit 2026",
    slug: "tech-summit-2026",
    status: "DRAFT",
    event_type: "FREE" as const,
    date_start: "2026-11-20T09:00:00Z",
    date_end: "2026-11-20T17:00:00Z",
    location: "Main Convention Center, Hall B",
  };

  const sampleForm = {
    id: "form-123",
    fields: [
      { id: "name", label: "Full Name", required: true },
      { id: "email", label: "Email Address", required: true },
    ],
  };

  const baseMetrics = {
    registrationsCount: 0,
    ticketsCount: 0,
    checkedInCount: 0,
    pendingPaymentsCount: 0,
  };

  describe("1. Draft State — Setup Checklist & Action Priority", () => {
    it("prioritizes 'Build Registration Form' when form has 0 configured fields", () => {
      const config = getWorkspaceStatusConfig(baseEvent, { fields: [] }, baseMetrics);

      expect(config.status).toBe("DRAFT");
      expect(config.primaryAction.actionType).toBe("build_form");
      expect(config.primaryAction.label).toContain("Build Registration Form");
      expect(config.primaryAction.href).toBe(`/org/events/${baseEvent.id}/form`);
      expect(config.blockerMessage).toContain("Registration form requires at least one question");
    });

    it("prioritizes 'Complete Event Schedule' when form is configured but location/date is missing", () => {
      const eventWithoutLocation = {
        ...baseEvent,
        location: null,
      };
      const config = getWorkspaceStatusConfig(eventWithoutLocation, sampleForm, baseMetrics);

      expect(config.primaryAction.actionType).toBe("edit_details");
      expect(config.primaryAction.label).toContain("Complete Event Schedule");
      expect(config.blockerMessage).toContain("Specify start date and venue location");
    });

    it("prioritizes 'Complete Payment Setup' for paid event with missing banking credentials", () => {
      const paidEventIncomplete = {
        ...baseEvent,
        event_type: "PAID" as const,
        payment_config: {
          payment_method: "Bank Transfer",
          account_number: "", // missing
          amount: "50",
        },
      };
      const config = getWorkspaceStatusConfig(paidEventIncomplete, sampleForm, baseMetrics);

      expect(config.primaryAction.actionType).toBe("edit_details");
      expect(config.primaryAction.label).toContain("Complete Payment Setup");
      expect(config.blockerMessage).toContain("Banking instructions and ticket pricing are required");
    });

    it("prioritizes 'Publish Event' when all checklist prerequisites are fully complete", () => {
      const config = getWorkspaceStatusConfig(baseEvent, sampleForm, baseMetrics);

      expect(config.primaryAction.actionType).toBe("publish_event");
      expect(config.primaryAction.label).toBe("Publish Event");
      expect(config.blockerMessage).toBeUndefined();

      const checklist = evaluatePublicationChecklist(baseEvent, sampleForm);
      expect(checklist.isReadyToPublish).toBe(true);
      expect(checklist.completedCount).toBe(4);
    });
  });

  describe("2. Published State — Readiness & Payment Queue", () => {
    it("configures Published workspace with 'Start Event (Go Live)' as primary action", () => {
      const publishedEvent = { ...baseEvent, status: "PUBLISHED" };
      const config = getWorkspaceStatusConfig(publishedEvent, sampleForm, {
        ...baseMetrics,
        registrationsCount: 42,
        ticketsCount: 42,
      });

      expect(config.status).toBe("PUBLISHED");
      expect(config.primaryAction.actionType).toBe("start_event");
      expect(config.primaryAction.label).toContain("Start Event");
      expect(config.focusText).toContain("42 attendees registered");
    });

    it("highlights pending payments review when paid event has unreviewed submissions", () => {
      const paidPublishedEvent = {
        ...baseEvent,
        status: "PUBLISHED",
        event_type: "PAID" as const,
      };
      const config = getWorkspaceStatusConfig(paidPublishedEvent, sampleForm, {
        registrationsCount: 15,
        ticketsCount: 10,
        checkedInCount: 0,
        pendingPaymentsCount: 5,
      });

      expect(config.status).toBe("PUBLISHED");
      expect(config.focusText).toContain("5 attendee payment claims require manual verification");
      expect(config.nextMeaningfulAction).toContain("Review pending attendee payment submissions");
    });
  });

  describe("3. Live State — Entrance Turnstiles & Verification", () => {
    it("makes 'Open Gate Scanner' the dominant primary action for Live events", () => {
      const liveEvent = { ...baseEvent, status: "LIVE" };
      const config = getWorkspaceStatusConfig(liveEvent, sampleForm, {
        registrationsCount: 100,
        ticketsCount: 100,
        checkedInCount: 35,
        pendingPaymentsCount: 0,
      });

      expect(config.status).toBe("LIVE");
      expect(config.primaryAction.actionType).toBe("open_scanner");
      expect(config.primaryAction.label).toBe("Open Gate Scanner");
      expect(config.primaryAction.href).toBe(`/verify?event_id=${liveEvent.id}`);
      expect(config.focusText).toContain("35 attendees admitted");
      expect(config.focusText).toContain("65 awaiting arrival");
    });

    it("permits transitions to ENDED or CANCELLED from LIVE", () => {
      const liveEvent = { ...baseEvent, status: "LIVE" };
      const config = getWorkspaceStatusConfig(liveEvent, sampleForm, baseMetrics);

      expect(config.allowedTransitions).toEqual(["ENDED", "CANCELLED"]);
    });
  });

  describe("4. Ended State — Final Outcome & Closeout", () => {
    it("configures Ended state with historical review and zero scanner/start actions", () => {
      const endedEvent = { ...baseEvent, status: "ENDED" };
      const config = getWorkspaceStatusConfig(endedEvent, sampleForm, {
        registrationsCount: 80,
        ticketsCount: 80,
        checkedInCount: 60,
        pendingPaymentsCount: 0,
      });

      expect(config.status).toBe("ENDED");
      expect(config.primaryAction.actionType).toBe("view_registrations");
      expect(config.focusText).toContain("75.0%");
      expect(config.focusText).toContain("60 of 80 ticket holders");
      expect(config.allowedTransitions).toHaveLength(0); // Terminal state
    });
  });

  describe("5. Cancelled State — Operations Suspended", () => {
    it("configures Cancelled state with terminal guard and no executable operational actions", () => {
      const cancelledEvent = { ...baseEvent, status: "CANCELLED" };
      const config = getWorkspaceStatusConfig(cancelledEvent, sampleForm, baseMetrics);

      expect(config.status).toBe("CANCELLED");
      expect(config.primaryAction.actionType).toBe("view_registrations");
      expect(config.primaryAction.label).toContain("View Archived");
      expect(config.allowedTransitions).toHaveLength(0); // Terminal state
    });
  });
});
