-- Migration 0003: Performance Optimization & Scalability Indexes
-- Phase 18: Performance & Scalability Review

-- 1. Accelerate public event lookup by slug (avoids full table scan when querying by slug without org_id)
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- 2. Accelerate organizer registration dashboard filtering by payment status (e.g. pending wire approvals)
CREATE INDEX IF NOT EXISTS idx_registrations_event_payment_status ON registrations(event_id, payment_status);

-- 3. Accelerate ticket searching by ticket number within an event
CREATE INDEX IF NOT EXISTS idx_tickets_event_ticket_number ON tickets(event_id, ticket_number);

-- 4. Accelerate ticket search by attendee email
CREATE INDEX IF NOT EXISTS idx_tickets_participant_email ON tickets(participant_email);

-- 5. Accelerate paginated compliance audit log queries (replaces in-memory sort with zero-cost index scan)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_created ON audit_logs(event_id, created_at DESC);

-- 6. Accelerate gate turnstile checkin throughput and real-time attendance stats
CREATE INDEX IF NOT EXISTS idx_checkins_event_created ON checkins(event_id, checked_in_at DESC);

-- 7. Accelerate verifier lookup by active session status
CREATE INDEX IF NOT EXISTS idx_event_verifiers_event_status ON event_verifiers(event_id, status);
