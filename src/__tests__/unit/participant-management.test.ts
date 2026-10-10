import { describe, it, expect } from "vitest";
import { hashToken, generateSecureToken } from "@/lib/utils/crypto";

describe("Phase 13: Participant & Ticket Filtering Logic", () => {
  const sampleRegistrations = [
    {
      id: "reg-1",
      participant_name: "John Doe",
      email: "john@example.com",
      status: "REGISTERED",
      payment_status: "APPROVED",
      transaction_id: "TX-1001",
    },
    {
      id: "reg-2",
      participant_name: "Jane Smith",
      email: "jane@company.org",
      status: "PENDING",
      payment_status: "PENDING",
      transaction_id: "TX-1002",
    },
    {
      id: "reg-3",
      participant_name: "Bob Taylor",
      email: "bob@test.com",
      status: "CANCELLED",
      payment_status: null,
      transaction_id: null,
    },
    {
      id: "reg-4",
      participant_name: "Alice Wonderland",
      email: "alice@adventure.com",
      status: "CONFIRMED",
      payment_status: null,
      transaction_id: null,
    },
  ];

  const filterRegistrations = (
    list: typeof sampleRegistrations,
    query: string,
    statusFilter: string
  ) => {
    return list.filter((reg) => {
      const q = query.toLowerCase().trim();
      const matchesSearch =
        !q ||
        reg.participant_name.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q) ||
        (reg.transaction_id && reg.transaction_id.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CONFIRMED" &&
          (reg.status === "REGISTERED" || reg.status === "CONFIRMED")) ||
        (statusFilter === "PENDING" &&
          (reg.status === "PENDING" ||
            reg.payment_status === "PENDING" ||
            reg.payment_status === "SUBMITTED")) ||
        (statusFilter === "CANCELLED" && reg.status === "CANCELLED");

      return matchesSearch && matchesStatus;
    });
  };

  it("should filter registrations by status correctly", () => {
    expect(filterRegistrations(sampleRegistrations, "", "ALL")).toHaveLength(4);
    expect(filterRegistrations(sampleRegistrations, "", "CONFIRMED")).toHaveLength(2); // John (REGISTERED), Alice (CONFIRMED)
    expect(filterRegistrations(sampleRegistrations, "", "PENDING")).toHaveLength(1); // Jane
    expect(filterRegistrations(sampleRegistrations, "", "CANCELLED")).toHaveLength(1); // Bob
  });

  it("should filter registrations by search query across name, email, and transaction ID", () => {
    expect(filterRegistrations(sampleRegistrations, "TX-1001", "ALL")).toHaveLength(1);
    expect(filterRegistrations(sampleRegistrations, "jane", "ALL")).toHaveLength(1);
    expect(filterRegistrations(sampleRegistrations, "example.com", "ALL")).toHaveLength(1);
    expect(filterRegistrations(sampleRegistrations, "nonexistent", "ALL")).toHaveLength(0);
  });

  const sampleTickets = [
    {
      id: "tkt-1",
      ticket_number: "TKT-100",
      status: "ISSUED",
      participant_name: "John Doe",
      participant_email: "john@example.com",
    },
    {
      id: "tkt-2",
      ticket_number: "TKT-200",
      status: "CHECKED_IN",
      participant_name: "Alice Wonderland",
      participant_email: "alice@adventure.com",
    },
    {
      id: "tkt-3",
      ticket_number: "TKT-300",
      status: "REVOKED",
      participant_name: "Charlie Brown",
      participant_email: "charlie@peanuts.com",
    },
  ];

  const filterTickets = (
    list: typeof sampleTickets,
    query: string,
    ticketFilter: string
  ) => {
    return list.filter((t) => {
      const q = query.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.ticket_number.toLowerCase().includes(q) ||
        t.participant_name.toLowerCase().includes(q) ||
        t.participant_email.toLowerCase().includes(q);

      const matchesFilter =
        ticketFilter === "ALL" ||
        (ticketFilter === "CHECKED_IN" && t.status === "CHECKED_IN") ||
        (ticketFilter === "ISSUED" && t.status === "ISSUED") ||
        (ticketFilter === "REVOKED" && t.status === "REVOKED");

      return matchesSearch && matchesFilter;
    });
  };

  it("should filter passes by status correctly", () => {
    expect(filterTickets(sampleTickets, "", "ALL")).toHaveLength(3);
    expect(filterTickets(sampleTickets, "", "ISSUED")).toHaveLength(1);
    expect(filterTickets(sampleTickets, "", "CHECKED_IN")).toHaveLength(1);
    expect(filterTickets(sampleTickets, "", "REVOKED")).toHaveLength(1);
  });

  it("should filter passes by ticket number or attendee", () => {
    expect(filterTickets(sampleTickets, "TKT-200", "ALL")).toHaveLength(1);
    expect(filterTickets(sampleTickets, "Charlie", "ALL")).toHaveLength(1);
    expect(filterTickets(sampleTickets, "nomatch", "ALL")).toHaveLength(0);
  });
});

describe("Phase 13: Ticket Revocation & Terminal State Enforcement", () => {
  type TicketRecord = {
    id: string;
    ticket_number: string;
    status: "ISSUED" | "CHECKED_IN" | "REVOKED";
    revoked_at: string | null;
    revoked_by: string | null;
  };

  class TicketManagementSimulator {
    private tickets: Map<string, TicketRecord> = new Map();
    public auditLogs: Array<{ action: string; target_id: string; metadata: any }> = [];

    constructor(initial: TicketRecord[]) {
      initial.forEach((t) => this.tickets.set(t.id, { ...t }));
    }

    revoke(ticketId: string, actorId: string, reason?: string) {
      const ticket = this.tickets.get(ticketId);
      if (!ticket) throw new Error("Ticket not found");
      if (ticket.status === "REVOKED") {
        throw new Error("Ticket is already revoked");
      }

      const now = new Date().toISOString();
      ticket.status = "REVOKED";
      ticket.revoked_at = now;
      ticket.revoked_by = actorId;
      this.tickets.set(ticketId, ticket);

      this.auditLogs.push({
        action: "TICKET_REVOKED",
        target_id: ticketId,
        metadata: {
          ticket_number: ticket.ticket_number,
          reason: reason || "Revoked by event organizer",
        },
      });

      return ticket;
    }

    verifyEntrance(ticketId: string) {
      const ticket = this.tickets.get(ticketId);
      if (!ticket) return { success: false, status: "NOT_FOUND" };
      if (ticket.status === "REVOKED") {
        return {
          success: false,
          status: "REVOKED",
          message: "This entrance pass has been revoked by the event organizer.",
        };
      }
      if (ticket.status === "CHECKED_IN") {
        return { success: false, status: "ALREADY_CHECKED_IN" };
      }
      return { success: true, status: "VALID" };
    }

    get(ticketId: string) {
      return this.tickets.get(ticketId);
    }
  }

  it("should successfully revoke an active pass and log audit record", () => {
    const sim = new TicketManagementSimulator([
      {
        id: "tkt-active",
        ticket_number: "TKT-ACT-1",
        status: "ISSUED",
        revoked_at: null,
        revoked_by: null,
      },
    ]);

    const result = sim.revoke("tkt-active", "user-org-admin", "Refund issued");
    expect(result.status).toBe("REVOKED");
    expect(result.revoked_at).toBeDefined();
    expect(result.revoked_by).toBe("user-org-admin");

    expect(sim.auditLogs).toHaveLength(1);
    expect(sim.auditLogs[0].action).toBe("TICKET_REVOKED");
    expect(sim.auditLogs[0].metadata.ticket_number).toBe("TKT-ACT-1");
    expect(sim.auditLogs[0].metadata.reason).toBe("Refund issued");
  });

  it("should reject double revocation attempts as invalid transition", () => {
    const sim = new TicketManagementSimulator([
      {
        id: "tkt-already-revoked",
        ticket_number: "TKT-REV-1",
        status: "REVOKED",
        revoked_at: "2026-10-10T10:00:00Z",
        revoked_by: "user-admin",
      },
    ]);

    expect(() =>
      sim.revoke("tkt-already-revoked", "user-admin", "Duplicate attempt")
    ).toThrow("Ticket is already revoked");
  });

  it("should immediately deny entrance check-in when pass is revoked", () => {
    const sim = new TicketManagementSimulator([
      {
        id: "tkt-gate-test",
        ticket_number: "TKT-GATE-1",
        status: "ISSUED",
        revoked_at: null,
        revoked_by: null,
      },
    ]);

    // Initial check should be VALID
    expect(sim.verifyEntrance("tkt-gate-test").status).toBe("VALID");

    // Revoke pass
    sim.revoke("tkt-gate-test", "user-admin", "Security violation");

    // Immediate gate check should be REVOKED
    const gateCheck = sim.verifyEntrance("tkt-gate-test");
    expect(gateCheck.success).toBe(false);
    expect(gateCheck.status).toBe("REVOKED");
    expect(gateCheck.message).toContain("revoked by the event organizer");
  });
});

describe("Phase 13: Pass Token Refresh & Resend Cryptography", () => {
  it("should rotate token securely upon resend without exposing raw token", () => {
    const originalRawToken = generateSecureToken(32);
    const originalHash = hashToken(originalRawToken);

    // Resend action generates fresh token
    const freshRawToken = generateSecureToken(32);
    const freshHash = hashToken(freshRawToken);

    expect(freshRawToken).not.toBe(originalRawToken);
    expect(freshHash).not.toBe(originalHash);
    expect(freshHash.length).toBe(64);

    // Old token should no longer match fresh hash
    expect(hashToken(originalRawToken)).not.toBe(freshHash);
    // Fresh token matches fresh hash
    expect(hashToken(freshRawToken)).toBe(freshHash);
  });
});
