# Architectural Decisions

## Decision Log

### ADR-001: Monolithic Next.js Application

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** The application has a clear, bounded scope. All actors (org users, verifiers, participants) interact via the web.  
**Decision:** Build as a single Next.js application using the App Router. No microservices, no separate backend.  
**Rationale:** Reduces deployment complexity, eliminates inter-service communication overhead, simplifies development. The application scope does not justify distributed architecture.  
**Consequences:** Single deployment unit. Scaling is vertical + Vercel's edge/serverless model.

---

### ADR-002: Supabase for Auth + Database

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Need managed PostgreSQL and authentication. Supabase provides both with Row-Level Security, built-in auth, and a TypeScript client.  
**Decision:** Use Supabase as the primary database and auth provider.  
**Rationale:** Eliminates infrastructure management, provides RLS for organization isolation, handles password hashing and session management.  
**Consequences:** Vendor coupling to Supabase. Migration to raw PostgreSQL is possible but requires reimplementing auth. Acceptable for the project scope.

---

### ADR-003: Verifier Auth via Application-Managed Tokens (Not Supabase Auth)

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Verifiers need temporary, event-scoped access. They are NOT organization users. Supabase Auth creates permanent users in `auth.users`.  
**Decision:** Verifier authentication uses application-managed magic link tokens. Verifier sessions are stored as signed HTTP-only cookies with explicit scope claims.  
**Rationale:** Creating Supabase Auth users for temporary verifiers pollutes the user table, complicates cleanup, and conflates two different access patterns. Application-managed tokens allow precise scoping and automatic expiry.  
**Consequences:** Must implement token generation, validation, and session management ourselves. Additional code but cleaner separation of concerns.

---

### ADR-004: SHA-256 Hashed Token Storage

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Ticket tokens and verifier invitation tokens are secrets. If the database is compromised, raw tokens would allow ticket forgery.  
**Decision:** Store only SHA-256 hashes of ticket tokens and invitation tokens. Raw tokens exist only in QR codes, URLs, and emails.  
**Rationale:** Defense in depth. Database compromise does not immediately enable ticket forgery. SHA-256 is fast for lookup (no need for bcrypt since tokens have 256 bits of entropy).  
**Consequences:** Token lookup requires hashing the presented token first. Negligible performance impact.

---

### ADR-005: Atomic Check-in via Database Transaction + UNIQUE Constraint

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Multiple verifiers may scan the same ticket simultaneously. Must guarantee exactly one successful check-in.  
**Decision:** Use a database transaction that atomically updates `tickets.status` to `CHECKED_IN` (WHERE status = 'ISSUED') AND inserts into `checkins` (which has a UNIQUE constraint on `ticket_id`).  
**Rationale:** The UNIQUE constraint on `checkins.ticket_id` is the ultimate concurrency guard. Even if the UPDATE is somehow not sufficient, the INSERT will fail for concurrent requests.  
**Consequences:** Verification endpoint must handle constraint violation errors gracefully. Both UPDATE and INSERT are in one transaction.

---

### ADR-006: Registration Form Schema as JSONB

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Organizations define custom registration form fields. Creating a database column per field is impractical.  
**Decision:** Store form schema as JSONB in `registration_forms.fields` and submitted data as JSONB in `registrations.form_data`.  
**Rationale:** Flexible, schema-validated at the application level using Zod, no migration needed when fields change.  
**Consequences:** Cannot use database-level constraints on individual form fields. Application-level validation is the primary guard. Acceptable trade-off for flexibility.

---

### ADR-007: Unified Ticket Issuance Pipeline

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Tickets can be issued via three paths: automatic (free), approval-triggered (paid), and admin-direct.  
**Decision:** All three paths use the same `issueTicket()` service function. The only difference is the source of participant data and the trigger.  
**Rationale:** Prevents logic duplication, ensures consistent ticket format, simplifies testing.  
**Consequences:** The service must be flexible enough to accept data from different sources. The `issued_by` and `registration_id` fields distinguish the issuance source.

---

### ADR-008: Separate Ticket Creation and Email Delivery

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Email delivery can fail. If ticket creation is coupled to email delivery, a failed email could leave the system in an inconsistent state.  
**Decision:** Ticket creation and email sending are separate steps. A ticket is created first, then email is attempted. "Resend Ticket" re-sends the email without creating a new ticket.  
**Rationale:** Ensures data consistency even when email delivery fails.  
**Consequences:** Must track email delivery status separately. Must implement "Resend" functionality.

---

### ADR-009: Event Slug Uniqueness Scoped to Organization

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Events need URL-friendly slugs for public registration URLs.  
**Decision:** Event slugs are unique within an organization (not globally). Public URLs use the full slug which is globally unique at the event level by including enough context.  
**Rationale:** Allows different organizations to use similar slugs without conflict within their own context. Public event URLs use `/events/{slug}` where slug is globally unique (enforced by a separate global unique index or by using a UUID-prefixed slug).  
**Consequences:** Need to handle slug conflicts within an organization. Public event lookup by slug must be unambiguous.

**Update:** After further consideration, event slugs will be globally unique to simplify public URL routing. `events.slug` has a global UNIQUE constraint.

---

### ADR-010: Tailwind CSS for Styling

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** The requirement specifies Tailwind CSS unless existing project convention requires otherwise. This is a new project.  
**Decision:** Use Tailwind CSS v4 for styling.  
**Rationale:** Rapid development, consistent design system, good mobile-first support, excellent Next.js integration.  
**Consequences:** Standard Tailwind setup with Next.js.

---

### ADR-011: Resend for Transactional Email

**Date:** 2026-10-07  
**Status:** Accepted  
**Context:** Need to send ticket emails to participants. Require a reliable transactional email service.  
**Decision:** Use Resend as the email provider.  
**Rationale:** Simple API, good deliverability, React Email support for template building, easy integration.  
**Consequences:** Requires Resend API key. Email sending is best-effort with retry capability.
