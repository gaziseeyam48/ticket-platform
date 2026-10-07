# Security Model

## 1. Core Security Principle

**The backend is the source of truth.**

Never trust:
- Frontend state
- QR payload contents
- Client timestamps
- Client-side event status
- Client-side authorization decisions
- Hidden form fields
- URL parameters alone

Every sensitive operation is verified on the server.

## 2. Authentication

### 2.1 Organization Users

**Provider:** Supabase Auth (email/password)

- Supabase manages password hashing (bcrypt), session tokens (JWT), and refresh tokens
- Sessions stored as HTTP-only cookies
- JWT verified server-side on every protected request
- Sessions have configurable expiration
- Logout invalidates the session

**Security measures:**
- Email confirmation required
- Password strength requirements enforced
- Rate limiting on auth endpoints (Supabase built-in)

### 2.2 Event Verifiers

**Mechanism:** Application-managed magic link tokens

- Admin creates verifier → generates 32-byte random invitation token
- Token is hashed (SHA-256) and stored in `event_verifiers.invitation_token_hash`
- Magic link sent via email: `/verify/auth?token={raw_token}&event={event_id}`
- On click: hash presented token, look up in DB, verify expiry and event status
- Create scoped session: HTTP-only cookie containing signed JWT with claims:
  - `verifier_id`
  - `event_id`
  - `organization_id`
  - `role: EVENT_VERIFIER`
  - `expires_at`

**Security measures:**
- Token is single-use (status changes to ACTIVE after first use)
- Session expires at `event_verifiers.expires_at` or when event ends
- Backend independently checks event status on every verification request
- Verifier cannot access any resource outside their assigned event

### 2.3 Participants

**No authentication.** Public endpoints only.

Participants access:
- `/events/{slug}/register` — submit registration
- `/t/{token}` — view their ticket

These endpoints have no session requirement.

## 3. Authorization

### 3.1 Organization Isolation

Every organization-scoped query includes `organization_id` in the WHERE clause.

```
User A (Org 1) requests Event X
→ Verify: Event X belongs to Org 1
→ Verify: User A belongs to Org 1
→ Only then: allow access
```

This is enforced at:
1. **Database level:** Row-Level Security policies
2. **Application level:** Auth guards in API routes and server actions
3. **Query level:** All queries filter by `organization_id`

### 3.2 Role-Based Access

| Role | Scope | Capabilities |
|------|-------|--------------|
| OWNER | Organization-wide | Full access, manage members |
| ADMIN | Organization-wide | Event management, no member management |
| EVENT_VERIFIER | Single event | Ticket verification only |

### 3.3 Verifier Scope Enforcement

Every verifier request must pass ALL checks:

1. ✅ Valid verifier session
2. ✅ Verifier exists in `event_verifiers`
3. ✅ Verifier status is ACTIVE
4. ✅ `expires_at > NOW()`
5. ✅ Event exists
6. ✅ `event.status = 'LIVE'`
7. ✅ `event.id` matches verifier's scoped `event_id`
8. ✅ `event.organization_id` matches verifier's scoped `organization_id`

Failure at any step → reject immediately.

## 4. Ticket Token Security

### 4.1 Token Generation

```
1. Generate: 32 bytes from crypto.getRandomValues() / crypto.randomBytes()
2. Encode:   Base64url encode → public_token (44 chars)
3. Hash:     SHA-256(public_token) → token_hash (64 hex chars)
4. Store:    token_hash in database
5. Deliver:  public_token in QR code and ticket URL
```

### 4.2 Token Properties

| Property | Value |
|----------|-------|
| Entropy | 256 bits (32 bytes) |
| Encoding | Base64url (URL-safe, no padding) |
| Storage | SHA-256 hash only |
| Lookup | By hash: O(1) with unique index |
| Predictability | Cryptographically unpredictable |

### 4.3 Why Hash Storage?

If the database is compromised, attackers cannot:
- Reconstruct valid ticket tokens from hashes
- Generate valid QR codes
- Forge ticket URLs

They can see ticket metadata but cannot impersonate tickets.

### 4.4 QR Payload

The QR code contains ONLY the raw token string.

**Never include in QR payload:**
- Participant personal data
- Payment information
- Internal database IDs
- Organization credentials
- Event details

The token is opaque. All meaning is resolved server-side.

## 5. Anti-Enumeration Protection

### 5.1 Ticket Lookup

- Ticket URLs use unpredictable tokens: `/t/{44-char-random-token}`
- Sequential enumeration is infeasible (2^256 keyspace)
- Invalid tokens return a generic "ticket not found" page
- No information leakage about valid tokens

### 5.2 Registration

- Rate limiting per IP on registration endpoints
- No indication whether an email is already registered (generic error)
- Event slugs are user-chosen but not sequential

## 6. Atomic Check-in

### 6.1 Concurrency Problem

Multiple verifiers may scan the same QR code simultaneously. Without protection, both could succeed, causing double check-in.

### 6.2 Solution

Use an atomic database operation:

```sql
-- Option A: Atomic UPDATE with status check
UPDATE tickets
SET status = 'CHECKED_IN',
    checked_in_at = NOW(),
    checked_in_by = :verifier_id
WHERE token_hash = :token_hash
  AND event_id = :event_id
  AND status = 'ISSUED'
RETURNING id, participant_name, status;

-- If rows_affected = 1 → check-in succeeded
-- If rows_affected = 0 → already checked in, revoked, or not found
```

```sql
-- Option B: INSERT into checkins with UNIQUE constraint
INSERT INTO checkins (ticket_id, event_id, verifier_id, checked_in_at)
VALUES (:ticket_id, :event_id, :verifier_id, NOW())
ON CONFLICT (ticket_id) DO NOTHING
RETURNING id;

-- If RETURNING yields a row → check-in succeeded
-- If no row returned → already checked in
```

**Chosen approach:** Combine both in a transaction. The `checkins` table UNIQUE constraint on `ticket_id` is the ultimate concurrency guard.

### 6.3 Full Verification Flow

```
1. Hash presented token
2. SELECT ticket by token_hash
3. Validate: ticket exists
4. Validate: ticket.event_id matches verifier's event
5. Validate: ticket.status = 'ISSUED'
6. BEGIN TRANSACTION
7.   UPDATE ticket SET status = 'CHECKED_IN' WHERE status = 'ISSUED'
8.   INSERT INTO checkins (with UNIQUE constraint)
9. COMMIT
10. If step 7 affected 0 rows → already used
11. If step 8 conflicts → already used (concurrent scan)
12. Return result
```

## 7. Input Validation

### 7.1 Server-Side Validation

ALL input is validated server-side using Zod schemas:

- Registration form submissions
- Event creation/editing
- Payment transaction IDs
- Admin-issued ticket data
- Verifier creation data

### 7.2 Validation Principles

- Validate type, format, length, and business rules
- Normalize emails (lowercase, trim)
- Sanitize text inputs (prevent XSS)
- Reject unexpected fields
- Return specific but safe error messages

## 8. Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 requests | 15 minutes |
| POST /api/auth/signup | 3 requests | 1 hour |
| POST /api/registrations | 10 requests | 15 minutes |
| POST /api/verify | 30 requests | 1 minute |
| GET /t/{token} | 20 requests | 1 minute |

Rate limiting implemented via middleware using IP-based tracking.

## 9. Web Security

| Threat | Mitigation |
|--------|------------|
| XSS | React's built-in escaping; Content-Security-Policy headers |
| CSRF | SameSite cookies; Supabase Auth CSRF protection |
| SQL Injection | Parameterized queries via Supabase client |
| Clickjacking | X-Frame-Options: DENY |
| Open Redirects | Whitelist allowed redirect URLs |
| Secret Exposure | Environment variables; .env excluded from git |
| Information Leakage | Generic error messages for public endpoints |

## 10. Data Protection

- Passwords: Managed by Supabase Auth (bcrypt)
- Ticket tokens: Only SHA-256 hash stored
- Invitation tokens: Only SHA-256 hash stored
- Personal data: Accessible only within organization scope
- Audit logs: No raw tokens or passwords logged
- Error messages: No stack traces, DB errors, or internal IDs exposed to users

## 11. Security Checklist (Per Phase)

For each phase, verify:

- [ ] All new endpoints require appropriate authentication
- [ ] Organization isolation enforced on new queries
- [ ] Input validated server-side with Zod
- [ ] No secrets in client-side code
- [ ] No sensitive data in error responses
- [ ] Rate limiting applied to public endpoints
- [ ] Database constraints match business rules
- [ ] Audit logging for sensitive operations
