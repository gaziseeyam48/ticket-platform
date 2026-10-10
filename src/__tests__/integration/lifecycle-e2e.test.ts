import { describe, it, expect, beforeEach } from "vitest";
import { hashToken, generateSecureToken, generateTicketNumber } from "@/lib/utils/crypto";
import { signVerifierSessionToken, verifyVerifierSessionToken } from "@/lib/services/verifier-session.service";
import { canTransitionEventStatus, isValidStatusTransition, type EventStatus } from "@/lib/validations/event";
import { canSubmitTransaction, assertValidPaymentTransition, isValidPaymentTransition, type PaymentStatus } from "@/lib/utils/payment-state";
import { AUDIT_ACTIONS } from "@/lib/services/audit.service";

/**
 * Complete End-to-End lifecycle simulation representing the unified system architecture.
 */
describe("Phase 16: End-to-End Event Lifecycle & Admission Pipeline", () => {
  // In-memory simulation database
  let db: {
    organizations: Map<string, any>;
    events: Map<string, any>;
    forms: Map<string, any>;
    registrations: Map<string, any>;
    tickets: Map<string, any>;
    verifiers: Map<string, any>;
    checkins: Map<string, any>;
    auditLogs: Array<any>;
  };

  beforeEach(() => {
    db = {
      organizations: new Map(),
      events: new Map(),
      forms: new Map(),
      registrations: new Map(),
      tickets: new Map(),
      verifiers: new Map(),
      checkins: new Map(),
      auditLogs: [],
    };
  });

  it("should successfully execute full event lifecycle from creation to turnstile gate conclusion", async () => {
    // -------------------------------------------------------------------------
    // STEP 1: Organization Creation
    // -------------------------------------------------------------------------
    const orgId = "org-summit-corp";
    db.organizations.set(orgId, {
      id: orgId,
      name: "Summit Corporation",
      slug: "summit-corp",
    });

    // -------------------------------------------------------------------------
    // STEP 2: Event Creation in DRAFT
    // -------------------------------------------------------------------------
    const eventId = "ev-tech-2026";
    const event = {
      id: eventId,
      organization_id: orgId,
      name: "Global Tech Summit 2026",
      slug: "global-tech-summit-2026",
      status: "DRAFT" as EventStatus,
      event_type: "PAID",
      payment_config: {
        payment_method: "BANK_TRANSFER",
        amount: "150",
        currency: "USD",
      },
    };
    db.events.set(eventId, event);
    db.auditLogs.push({ action: AUDIT_ACTIONS.EVENT_CREATED, event_id: eventId });

    expect(event.status).toBe("DRAFT");
    expect(db.auditLogs).toHaveLength(1);

    // -------------------------------------------------------------------------
    // STEP 3: Form Configuration
    // -------------------------------------------------------------------------
    const formFields = [
      { id: "field_name", type: "text", label: "Full Name", required: true },
      { id: "field_email", type: "email", label: "Work Email", required: true },
      { id: "field_dietary", type: "dropdown", label: "Dietary", options: ["None", "Vegan", "Halal"] },
    ];
    db.forms.set(eventId, { id: "form-1", event_id: eventId, fields: formFields });
    db.auditLogs.push({ action: AUDIT_ACTIONS.FORM_UPDATED, event_id: eventId });

    // -------------------------------------------------------------------------
    // STEP 4: Publish Event (DRAFT -> PUBLISHED)
    // -------------------------------------------------------------------------
    expect(isValidStatusTransition(event.status, "PUBLISHED")).toBe(true);
    event.status = "PUBLISHED";
    db.auditLogs.push({ action: AUDIT_ACTIONS.EVENT_PUBLISHED, event_id: eventId });

    // -------------------------------------------------------------------------
    // STEP 5: Attendee Registration (PAID Event Flow)
    // -------------------------------------------------------------------------
    const regId = "reg-attendee-01";
    const attendeeEmail = "david.clark@enterprise.com";
    const registration = {
      id: regId,
      event_id: eventId,
      participant_name: "David Clark",
      email: attendeeEmail,
      status: "REGISTERED",
      payment_status: "PENDING" as PaymentStatus,
      transaction_id: null as string | null,
    };
    db.registrations.set(regId, registration);
    db.auditLogs.push({ action: AUDIT_ACTIONS.REGISTRATION_CREATED, target_id: regId });

    // Participant submits bank transaction identifier
    expect(canSubmitTransaction(registration.payment_status)).toBe(true);
    expect(isValidPaymentTransition(registration.payment_status, "SUBMITTED")).toBe(true);
    registration.payment_status = "SUBMITTED";
    registration.transaction_id = "WIRE-TRX-998877";
    db.auditLogs.push({ action: AUDIT_ACTIONS.PAYMENT_SUBMITTED, target_id: regId });

    // Organizer reviews & approves payment
    expect(isValidPaymentTransition(registration.payment_status, "APPROVED")).toBe(true);
    registration.payment_status = "APPROVED";
    db.auditLogs.push({ action: AUDIT_ACTIONS.PAYMENT_APPROVED, target_id: regId });

    // -------------------------------------------------------------------------
    // STEP 6: Ticket Pass Issuance Pipeline
    // -------------------------------------------------------------------------
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const ticketNumber = generateTicketNumber("TKT");

    const ticket = {
      id: "tkt-001",
      event_id: eventId,
      registration_id: regId,
      ticket_number: ticketNumber,
      token_hash: tokenHash,
      status: "ISSUED",
      participant_name: registration.participant_name,
      participant_email: registration.email,
      issued_at: new Date().toISOString(),
      checked_in_at: null as string | null,
    };
    db.tickets.set(ticket.id, ticket);
    db.auditLogs.push({ action: AUDIT_ACTIONS.TICKET_ISSUED, target_id: ticket.id });

    expect(ticket.status).toBe("ISSUED");
    expect(ticket.token_hash).toHaveLength(64);

    // -------------------------------------------------------------------------
    // STEP 7: Event Starts (PUBLISHED -> LIVE)
    // -------------------------------------------------------------------------
    expect(isValidStatusTransition(event.status, "LIVE")).toBe(true);
    event.status = "LIVE";
    db.auditLogs.push({ action: AUDIT_ACTIONS.EVENT_STARTED, event_id: eventId });

    // -------------------------------------------------------------------------
    // STEP 8: Gate Verifier Staff Invitation & Session
    // -------------------------------------------------------------------------
    const verifierRawToken = generateSecureToken(32);
    const verifierHash = hashToken(verifierRawToken);
    const verifier = {
      id: "ver-gate-staff",
      event_id: eventId,
      organization_id: orgId,
      name: "Officer Sarah",
      email: "sarah@security.com",
      status: "ACTIVE",
    };
    db.verifiers.set(verifier.id, verifier);
    db.auditLogs.push({ action: AUDIT_ACTIONS.VERIFIER_INVITED, target_id: verifier.id });

    // Verifier authenticates and acquires scoped session
    const sessionToken = signVerifierSessionToken({
      verifier_id: verifier.id,
      verifier_name: verifier.name,
      verifier_email: verifier.email,
      event_id: eventId,
      organization_id: orgId,
      role: "EVENT_VERIFIER",
      exp: Math.floor(Date.now() / 1000) + 7200,
    });
    const verifierSession = verifyVerifierSessionToken(sessionToken);
    expect(verifierSession.event_id).toBe(eventId);

    // -------------------------------------------------------------------------
    // STEP 9: Turnstile Gate Verification & Admission
    // -------------------------------------------------------------------------
    // Gate scan simulator
    const scanGatePass = (inputToken: string, gateEventId: string) => {
      const scannedHash = hashToken(inputToken);
      let matchedTicket: any = null;
      for (const t of db.tickets.values()) {
        if (t.token_hash === scannedHash) {
          matchedTicket = t;
          break;
        }
      }

      if (!matchedTicket) return { success: false, status: "INVALID" };
      if (matchedTicket.event_id !== gateEventId) return { success: false, status: "WRONG_EVENT" };
      if (event.status !== "LIVE") return { success: false, status: "EVENT_NOT_LIVE" };
      if (matchedTicket.status === "REVOKED") return { success: false, status: "REVOKED" };
      if (matchedTicket.status === "CHECKED_IN") return { success: false, status: "ALREADY_CHECKED_IN" };

      // Atomic transition
      matchedTicket.status = "CHECKED_IN";
      matchedTicket.checked_in_at = new Date().toISOString();
      db.checkins.set(matchedTicket.id, { ticket_id: matchedTicket.id, checked_in_at: matchedTicket.checked_in_at });
      db.auditLogs.push({ action: AUDIT_ACTIONS.TICKET_CHECKED_IN, target_id: matchedTicket.id });

      return { success: true, status: "VALID", attendee: matchedTicket.participant_name };
    };

    // 1st Scan: Valid entrance permitted
    const firstScan = scanGatePass(rawToken, verifierSession.event_id);
    expect(firstScan.success).toBe(true);
    expect(firstScan.status).toBe("VALID");
    expect(firstScan.attendee).toBe("David Clark");

    // 2nd Scan: Duplicate check-in rejected
    const secondScan = scanGatePass(rawToken, verifierSession.event_id);
    expect(secondScan.success).toBe(false);
    expect(secondScan.status).toBe("ALREADY_CHECKED_IN");

    // -------------------------------------------------------------------------
    // STEP 10: Event Concludes (LIVE -> ENDED)
    // -------------------------------------------------------------------------
    expect(isValidStatusTransition(event.status, "ENDED")).toBe(true);
    event.status = "ENDED";
    db.auditLogs.push({ action: AUDIT_ACTIONS.EVENT_ENDED, event_id: eventId });

    // Turnstile check after event ends is blocked
    const postEndScan = scanGatePass(rawToken, verifierSession.event_id);
    expect(postEndScan.success).toBe(false);
    expect(postEndScan.status).toBe("EVENT_NOT_LIVE");

    // -------------------------------------------------------------------------
    // STEP 11: Audit Trail Verification
    // -------------------------------------------------------------------------
    const actionList = db.auditLogs.map((l) => l.action);
    expect(actionList).toContain(AUDIT_ACTIONS.EVENT_CREATED);
    expect(actionList).toContain(AUDIT_ACTIONS.FORM_UPDATED);
    expect(actionList).toContain(AUDIT_ACTIONS.EVENT_PUBLISHED);
    expect(actionList).toContain(AUDIT_ACTIONS.REGISTRATION_CREATED);
    expect(actionList).toContain(AUDIT_ACTIONS.PAYMENT_SUBMITTED);
    expect(actionList).toContain(AUDIT_ACTIONS.PAYMENT_APPROVED);
    expect(actionList).toContain(AUDIT_ACTIONS.TICKET_ISSUED);
    expect(actionList).toContain(AUDIT_ACTIONS.EVENT_STARTED);
    expect(actionList).toContain(AUDIT_ACTIONS.VERIFIER_INVITED);
    expect(actionList).toContain(AUDIT_ACTIONS.TICKET_CHECKED_IN);
    expect(actionList).toContain(AUDIT_ACTIONS.EVENT_ENDED);
  });
});
