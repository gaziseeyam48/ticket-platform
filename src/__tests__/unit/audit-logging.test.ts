import { describe, it, expect } from "vitest";
import { AUDIT_ACTIONS, AuditLogRecord } from "@/lib/services/audit.service";

describe("Phase 14: Audit Logging Actions & Taxonomy", () => {
  it("should define standard audit action types across all system operational domains", () => {
    // Event lifecycle
    expect(AUDIT_ACTIONS.EVENT_CREATED).toBe("EVENT_CREATED");
    expect(AUDIT_ACTIONS.EVENT_UPDATED).toBe("EVENT_UPDATED");
    expect(AUDIT_ACTIONS.EVENT_PUBLISHED).toBe("EVENT_PUBLISHED");
    expect(AUDIT_ACTIONS.EVENT_STARTED).toBe("EVENT_STARTED");
    expect(AUDIT_ACTIONS.EVENT_ENDED).toBe("EVENT_ENDED");
    expect(AUDIT_ACTIONS.EVENT_CANCELLED).toBe("EVENT_CANCELLED");

    // Form builder
    expect(AUDIT_ACTIONS.FORM_UPDATED).toBe("FORM_UPDATED");

    // Registrations & Payments
    expect(AUDIT_ACTIONS.REGISTRATION_CREATED).toBe("REGISTRATION_CREATED");
    expect(AUDIT_ACTIONS.PAYMENT_SUBMITTED).toBe("PAYMENT_SUBMITTED");
    expect(AUDIT_ACTIONS.PAYMENT_APPROVED).toBe("PAYMENT_APPROVED");
    expect(AUDIT_ACTIONS.PAYMENT_REJECTED).toBe("PAYMENT_REJECTED");

    // Tickets & Passes
    expect(AUDIT_ACTIONS.TICKET_ISSUED).toBe("TICKET_ISSUED");
    expect(AUDIT_ACTIONS.TICKET_REVOKED).toBe("TICKET_REVOKED");
    expect(AUDIT_ACTIONS.TICKET_RESENT).toBe("TICKET_RESENT");

    // Turnstile Check-ins
    expect(AUDIT_ACTIONS.TICKET_CHECKED_IN).toBe("TICKET_CHECKED_IN");

    // Verifier Staff
    expect(AUDIT_ACTIONS.VERIFIER_INVITED).toBe("VERIFIER_INVITED");
    expect(AUDIT_ACTIONS.VERIFIER_RESENT).toBe("VERIFIER_RESENT");
    expect(AUDIT_ACTIONS.VERIFIER_REVOKED).toBe("VERIFIER_REVOKED");
  });

  it("should categorize actions accurately for security log analysis", () => {
    const categorizeAction = (action: string) => {
      if (action.startsWith("EVENT_")) return "LIFECYCLE";
      if (action.includes("PAYMENT")) return "PAYMENTS";
      if (action.startsWith("REGISTRATION_") || action.includes("FORM_")) return "REGISTRATIONS";
      if (action.startsWith("TICKET_") && action !== "TICKET_CHECKED_IN") return "TICKETS";
      if (action === "TICKET_CHECKED_IN") return "CHECKINS";
      if (action.startsWith("VERIFIER_")) return "VERIFIERS";
      return "OTHER";
    };

    expect(categorizeAction(AUDIT_ACTIONS.EVENT_STARTED)).toBe("LIFECYCLE");
    expect(categorizeAction(AUDIT_ACTIONS.PAYMENT_APPROVED)).toBe("PAYMENTS");
    expect(categorizeAction(AUDIT_ACTIONS.REGISTRATION_CREATED)).toBe("REGISTRATIONS");
    expect(categorizeAction(AUDIT_ACTIONS.FORM_UPDATED)).toBe("REGISTRATIONS");
    expect(categorizeAction(AUDIT_ACTIONS.TICKET_REVOKED)).toBe("TICKETS");
    expect(categorizeAction(AUDIT_ACTIONS.TICKET_CHECKED_IN)).toBe("CHECKINS");
    expect(categorizeAction(AUDIT_ACTIONS.VERIFIER_INVITED)).toBe("VERIFIERS");
  });
});

describe("Phase 14: Audit Trail Querying & Multi-Dimensional Filtering", () => {
  const sampleLogs: AuditLogRecord[] = [
    {
      id: "log-1",
      organization_id: "org-alpha",
      event_id: "ev-101",
      actor_id: "user-alice",
      actor_type: "USER",
      action: "EVENT_CREATED",
      target_type: "EVENT",
      target_id: "ev-101",
      metadata: { name: "DevCon 2026", event_type: "FREE" },
      ip_address: null,
      created_at: "2026-10-10T10:00:00Z",
      events: { id: "ev-101", name: "DevCon 2026", slug: "devcon-2026" },
    },
    {
      id: "log-2",
      organization_id: "org-alpha",
      event_id: "ev-101",
      actor_id: null,
      actor_type: "SYSTEM",
      action: "REGISTRATION_CREATED",
      target_type: "REGISTRATION",
      target_id: "reg-501",
      metadata: { participant_name: "Bob Smith", email: "bob@example.com" },
      ip_address: null,
      created_at: "2026-10-10T11:00:00Z",
      events: { id: "ev-101", name: "DevCon 2026", slug: "devcon-2026" },
    },
    {
      id: "log-3",
      organization_id: "org-alpha",
      event_id: "ev-101",
      actor_id: "ver-staff-1",
      actor_type: "VERIFIER",
      action: "TICKET_CHECKED_IN",
      target_type: "TICKET",
      target_id: "tkt-901",
      metadata: { ticket_number: "TKT-888999", participant_name: "Bob Smith" },
      ip_address: null,
      created_at: "2026-10-10T12:00:00Z",
      events: { id: "ev-101", name: "DevCon 2026", slug: "devcon-2026" },
    },
    {
      id: "log-4",
      organization_id: "org-alpha",
      event_id: "ev-102",
      actor_id: "user-alice",
      actor_type: "USER",
      action: "TICKET_REVOKED",
      target_type: "TICKET",
      target_id: "tkt-999",
      metadata: { ticket_number: "TKT-VOID-1", reason: "Disciplinary" },
      ip_address: null,
      created_at: "2026-10-10T13:00:00Z",
      events: { id: "ev-102", name: "VIP Summit", slug: "vip-summit" },
    },
    {
      id: "log-5",
      organization_id: "org-beta", // Belongs to a different organization
      event_id: "ev-201",
      actor_id: "user-charlie",
      actor_type: "USER",
      action: "EVENT_CREATED",
      target_type: "EVENT",
      target_id: "ev-201",
      metadata: { name: "Other Org Expo" },
      ip_address: null,
      created_at: "2026-10-10T14:00:00Z",
      events: { id: "ev-201", name: "Other Org Expo", slug: "other-expo" },
    },
  ];

  const filterAuditLogs = (
    logs: AuditLogRecord[],
    params: {
      organizationId: string;
      eventId?: string;
      action?: string;
      actorType?: string;
      search?: string;
    }
  ) => {
    return logs.filter((log) => {
      // Tenant isolation: must strictly match organizationId
      if (log.organization_id !== params.organizationId) return false;

      if (params.eventId && params.eventId !== "ALL" && log.event_id !== params.eventId) {
        return false;
      }

      if (params.action && params.action !== "ALL" && log.action !== params.action) {
        return false;
      }

      if (params.actorType && params.actorType !== "ALL" && log.actor_type !== params.actorType) {
        return false;
      }

      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        const actionMatch = log.action.toLowerCase().includes(q);
        const actorMatch = log.actor_id?.toLowerCase().includes(q);
        const targetMatch = log.target_id?.toLowerCase().includes(q);
        const metaStr = log.metadata ? JSON.stringify(log.metadata).toLowerCase() : "";
        const metaMatch = metaStr.includes(q);

        return actionMatch || actorMatch || targetMatch || metaMatch;
      }

      return true;
    });
  };

  it("should enforce strict tenant isolation (org-alpha never sees org-beta)", () => {
    const orgAlphaLogs = filterAuditLogs(sampleLogs, { organizationId: "org-alpha" });
    expect(orgAlphaLogs).toHaveLength(4);
    expect(orgAlphaLogs.every((l) => l.organization_id === "org-alpha")).toBe(true);

    const orgBetaLogs = filterAuditLogs(sampleLogs, { organizationId: "org-beta" });
    expect(orgBetaLogs).toHaveLength(1);
    expect(orgBetaLogs[0].target_id).toBe("ev-201");
  });

  it("should filter audit logs by specific event ID", () => {
    const ev102Logs = filterAuditLogs(sampleLogs, {
      organizationId: "org-alpha",
      eventId: "ev-102",
    });
    expect(ev102Logs).toHaveLength(1);
    expect(ev102Logs[0].action).toBe("TICKET_REVOKED");
  });

  it("should filter audit logs by actor type", () => {
    const verifierLogs = filterAuditLogs(sampleLogs, {
      organizationId: "org-alpha",
      actorType: "VERIFIER",
    });
    expect(verifierLogs).toHaveLength(1);
    expect(verifierLogs[0].action).toBe("TICKET_CHECKED_IN");

    const systemLogs = filterAuditLogs(sampleLogs, {
      organizationId: "org-alpha",
      actorType: "SYSTEM",
    });
    expect(systemLogs).toHaveLength(1);
    expect(systemLogs[0].action).toBe("REGISTRATION_CREATED");
  });

  it("should search audit logs by metadata payload (e.g. ticket number or attendee name)", () => {
    const searchByTicketNumber = filterAuditLogs(sampleLogs, {
      organizationId: "org-alpha",
      search: "TKT-888999",
    });
    expect(searchByTicketNumber).toHaveLength(1);
    expect(searchByTicketNumber[0].action).toBe("TICKET_CHECKED_IN");

    const searchByName = filterAuditLogs(sampleLogs, {
      organizationId: "org-alpha",
      search: "Bob Smith",
    });
    expect(searchByName).toHaveLength(2); // Registration & Check-in
  });
});
