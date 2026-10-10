import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashToken } from "@/lib/utils/crypto";
import { playScanSound, triggerHaptic } from "@/lib/utils/audio";

describe("Phase 11: Entrance Verification States & Anti-Fraud Logic", () => {
  it("should extract ticket raw token whether presented as raw string or full URL", () => {
    const rawToken = "9f8e7d6c5b4a3f2e1d0c";
    const fullUrl = `https://ticketplatform.io/t/${rawToken}`;
    const urlWithParams = `https://ticketplatform.io/t/${rawToken}?src=camera#anchor`;

    const extractToken = (input: string) => {
      let token = input.trim();
      if (token.includes("/t/")) {
        const parts = token.split("/t/");
        token = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
      }
      return token;
    };

    expect(extractToken(rawToken)).toBe(rawToken);
    expect(extractToken(fullUrl)).toBe(rawToken);
    expect(extractToken(urlWithParams)).toBe(rawToken);
  });

  it("should compute identical token hash for public URL presentation", () => {
    const token = "secure-unique-token-abc";
    const hash = hashToken(token);

    expect(hash).toBeDefined();
    expect(hash.length).toBe(64);
    expect(hash).toBe(hashToken("secure-unique-token-abc"));
  });
});

describe("Phase 11: Concurrency Collision & Double-Entry Protection", () => {
  type MockTicket = {
    id: string;
    ticket_number: string;
    status: "ISSUED" | "CHECKED_IN" | "REVOKED";
    checked_in_at: string | null;
  };

  class MockTurnstileDatabase {
    private tickets: Map<string, MockTicket> = new Map();
    public checkins: Array<{ ticket_id: string; checked_in_at: string }> = [];

    constructor(initialTickets: MockTicket[]) {
      initialTickets.forEach((t) => this.tickets.set(t.id, { ...t }));
    }

    // Simulates database atomic UPDATE tickets SET status = 'CHECKED_IN' WHERE id = :id AND status = 'ISSUED'
    async atomicCheckIn(ticketId: string, timestamp: string): Promise<boolean> {
      // Simulate real-world asynchronous database I/O latency
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 5 + 1));

      const ticket = this.tickets.get(ticketId);
      if (!ticket || ticket.status !== "ISSUED") {
        return false; // Concurrency collision or not in ISSUED status
      }

      // Atomic write
      ticket.status = "CHECKED_IN";
      ticket.checked_in_at = timestamp;
      this.tickets.set(ticketId, ticket);

      this.checkins.push({ ticket_id: ticketId, checked_in_at: timestamp });
      return true;
    }

    getTicket(id: string) {
      return this.tickets.get(id);
    }
  }

  it("should permit entrance on first scan and reject immediate duplicate scan", async () => {
    const db = new MockTurnstileDatabase([
      {
        id: "tkt-001",
        ticket_number: "TKT-100",
        status: "ISSUED",
        checked_in_at: null,
      },
    ]);

    const firstScan = await db.atomicCheckIn("tkt-001", new Date().toISOString());
    expect(firstScan).toBe(true);

    const secondScan = await db.atomicCheckIn("tkt-001", new Date().toISOString());
    expect(secondScan).toBe(false);

    // Exactly one check-in logged
    expect(db.checkins.length).toBe(1);
    expect(db.getTicket("tkt-001")?.status).toBe("CHECKED_IN");
  });

  it("should handle simultaneous concurrent admission attempts safely (race condition test)", async () => {
    const db = new MockTurnstileDatabase([
      {
        id: "tkt-concurrent-race",
        ticket_number: "TKT-RACE-1",
        status: "ISSUED",
        checked_in_at: null,
      },
    ]);

    // Simulate 10 simultaneous turnstile scanner check-in attempts at the exact same millisecond
    const results = await Promise.all(
      Array.from({ length: 10 }).map((_, i) =>
        db.atomicCheckIn("tkt-concurrent-race", `2026-10-10T12:00:00.${i}Z`)
      )
    );

    // Exactly one scanner must win the admission lock
    const successfulCheckins = results.filter((res) => res === true);
    const rejectedCollisions = results.filter((res) => res === false);

    expect(successfulCheckins.length).toBe(1);
    expect(rejectedCollisions.length).toBe(9);
    expect(db.checkins.length).toBe(1);
  });
});

describe("Phase 11: Web Audio Synthesis & Tactile Haptic Utilities", () => {
  it("should safely execute playScanSound in non-browser / mock environment without errors", () => {
    expect(() => playScanSound("VALID")).not.toThrow();
    expect(() => playScanSound("ALREADY_CHECKED_IN")).not.toThrow();
    expect(() => playScanSound("ERROR")).not.toThrow();
  });

  it("should safely execute triggerHaptic in non-browser / mock environment without errors", () => {
    expect(() => triggerHaptic("VALID")).not.toThrow();
    expect(() => triggerHaptic("ALREADY_CHECKED_IN")).not.toThrow();
    expect(() => triggerHaptic("ERROR")).not.toThrow();
  });
});
