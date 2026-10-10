import { getAdminClient } from "@/lib/db/admin";

export const AUDIT_ACTIONS = {
  // Event Lifecycle
  EVENT_CREATED: "EVENT_CREATED",
  EVENT_UPDATED: "EVENT_UPDATED",
  EVENT_PUBLISHED: "EVENT_PUBLISHED",
  EVENT_STARTED: "EVENT_STARTED",
  EVENT_ENDED: "EVENT_ENDED",
  EVENT_CANCELLED: "EVENT_CANCELLED",

  // Form Configuration
  FORM_UPDATED: "FORM_UPDATED",

  // Registrations & Payments
  REGISTRATION_CREATED: "REGISTRATION_CREATED",
  REGISTRATION_CANCELLED: "REGISTRATION_CANCELLED",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAYMENT_APPROVED: "PAYMENT_APPROVED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",

  // Ticket Operations
  TICKET_ISSUED: "TICKET_ISSUED",
  TICKET_REVOKED: "TICKET_REVOKED",
  TICKET_RESENT: "TICKET_RESENT",

  // Turnstile Gate Verification
  TICKET_CHECKED_IN: "TICKET_CHECKED_IN",

  // Gate Staff / Verifiers
  VERIFIER_INVITED: "VERIFIER_INVITED",
  VERIFIER_RESENT: "VERIFIER_RESENT",
  VERIFIER_REVOKED: "VERIFIER_REVOKED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS] | string;
export type AuditActorType = "USER" | "VERIFIER" | "SYSTEM";

export interface LogAuditParams {
  organizationId?: string | null;
  eventId?: string | null;
  actorId?: string | null;
  actorType: AuditActorType;
  action: AuditAction;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
}

export interface AuditLogRecord {
  id: string;
  organization_id: string | null;
  event_id: string | null;
  actor_id: string | null;
  actor_type: AuditActorType;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  events?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Centralized audit logging pipeline.
 * Non-fatal by design: logging errors are caught and surfaced as warnings
 * to ensure that transactional operations (check-ins, payments) are never interrupted.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<{ success: boolean; error?: string }> {
  try {
    const adminDb = getAdminClient();

    const insertPayload: any = {
      organization_id: params.organizationId || null,
      event_id: params.eventId || null,
      actor_id: params.actorId || null,
      actor_type: params.actorType,
      action: params.action,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      metadata: params.metadata || null,
      ip_address: params.ipAddress || null,
    };

    const { error } = await (adminDb.from("audit_logs") as any).insert(insertPayload);

    if (error) {
      console.warn("Audit log insert warning:", error.message, params);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn("Audit logging encountered unexpected exception:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export interface GetAuditLogsParams {
  organizationId: string;
  eventId?: string;
  action?: string;
  actorType?: string;
  targetType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Retrieves audit log history for an organization with multi-dimensional filtering.
 */
export async function getOrganizationAuditLogs(params: GetAuditLogsParams): Promise<{
  logs: AuditLogRecord[];
  totalCount: number;
}> {
  const adminDb = getAdminClient();
  const limit = Math.min(params.limit || 50, 100);
  const offset = params.offset || 0;

  let query = (adminDb.from("audit_logs") as any)
    .select("*, events(id, name, slug)", { count: "exact" })
    .eq("organization_id", params.organizationId)
    .order("created_at", { ascending: false });

  if (params.eventId && params.eventId !== "ALL") {
    query = query.eq("event_id", params.eventId);
  }

  if (params.action && params.action !== "ALL") {
    query = query.eq("action", params.action);
  }

  if (params.actorType && params.actorType !== "ALL") {
    query = query.eq("actor_type", params.actorType);
  }

  if (params.targetType && params.targetType !== "ALL") {
    query = query.eq("target_type", params.targetType);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to query audit logs:", error);
    return { logs: [], totalCount: 0 };
  }

  let results: AuditLogRecord[] = data || [];

  // Optional client-side search across metadata / IDs if search parameter provided
  if (params.search && params.search.trim()) {
    const s = params.search.trim().toLowerCase();
    results = results.filter((item) => {
      const actorMatch = item.actor_id?.toLowerCase().includes(s);
      const targetMatch = item.target_id?.toLowerCase().includes(s);
      const actionMatch = item.action.toLowerCase().includes(s);
      const eventMatch = item.events?.name?.toLowerCase().includes(s);
      const metaStr = item.metadata ? JSON.stringify(item.metadata).toLowerCase() : "";
      const metaMatch = metaStr.includes(s);
      return actorMatch || targetMatch || actionMatch || eventMatch || metaMatch;
    });
  }

  return {
    logs: results,
    totalCount: count || results.length,
  };
}
