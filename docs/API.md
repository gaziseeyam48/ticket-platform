# API Design

## 1. API Style

Server-side operations use **Next.js Server Actions** and **API Routes** (App Router).

- **Server Actions**: Used for form submissions and mutations from the dashboard UI
- **API Routes**: Used for programmatic endpoints (verification, webhooks, public registration)

All API routes are under `/api/`.

## 2. Authentication Headers

- **Organization users**: Supabase Auth JWT in HTTP-only cookie (automatic via Supabase client)
- **Verifiers**: Custom JWT in HTTP-only cookie (`verifier_session`)
- **Participants**: No authentication required

## 3. API Endpoints

### 3.1 Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | None | Create account + organization |
| POST | /api/auth/login | None | Login |
| POST | /api/auth/logout | User | Logout |
| GET | /api/auth/session | User | Get current session |

### 3.2 Organizations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organizations | User | List user's organizations |
| GET | /api/organizations/:orgId | User+Owner | Get organization details |
| PATCH | /api/organizations/:orgId | User+Owner | Update organization |

### 3.3 Events

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/organizations/:orgId/events | User | Create event |
| GET | /api/organizations/:orgId/events | User | List organization events |
| GET | /api/organizations/:orgId/events/:eventId | User | Get event details |
| PATCH | /api/organizations/:orgId/events/:eventId | User | Update event |
| POST | /api/organizations/:orgId/events/:eventId/publish | User | Publish event |
| POST | /api/organizations/:orgId/events/:eventId/start | User | Start event (→ LIVE) |
| POST | /api/organizations/:orgId/events/:eventId/end | User | End event (→ ENDED) |
| POST | /api/organizations/:orgId/events/:eventId/cancel | User | Cancel event |

### 3.4 Registration Forms

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organizations/:orgId/events/:eventId/form | User | Get form configuration |
| PUT | /api/organizations/:orgId/events/:eventId/form | User | Save form configuration |

### 3.5 Public Registration

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/public/events/:slug | None | Get public event info + form |
| POST | /api/public/events/:slug/register | None | Submit registration |
| POST | /api/public/events/:slug/payment | None | Submit transaction ID |

### 3.6 Registrations (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organizations/:orgId/events/:eventId/registrations | User | List registrations |
| GET | /api/organizations/:orgId/events/:eventId/registrations/:regId | User | Get registration |
| POST | /api/organizations/:orgId/events/:eventId/registrations/:regId/approve | User | Approve payment & issue ticket |
| POST | /api/organizations/:orgId/events/:eventId/registrations/:regId/reject | User | Reject payment |

### 3.7 Tickets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organizations/:orgId/events/:eventId/tickets | User | List tickets |
| POST | /api/organizations/:orgId/events/:eventId/tickets/issue | User | Admin direct issue |
| POST | /api/organizations/:orgId/events/:eventId/tickets/:ticketId/revoke | User | Revoke ticket |
| POST | /api/organizations/:orgId/events/:eventId/tickets/:ticketId/resend | User | Resend ticket email |
| GET | /api/public/tickets/:token | None | Get ticket for display |

### 3.8 Verifiers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organizations/:orgId/events/:eventId/verifiers | User | List verifiers |
| POST | /api/organizations/:orgId/events/:eventId/verifiers | User | Create & invite verifier |
| DELETE | /api/organizations/:orgId/events/:eventId/verifiers/:verifierId | User | Revoke verifier |
| POST | /api/verify/auth | None | Verifier magic link auth |

### 3.9 Verification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/verify/checkin | Verifier | Verify & check-in ticket |
| GET | /api/verify/event | Verifier | Get event info for verifier |

### 3.10 Audit Logs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/organizations/:orgId/events/:eventId/audit | User | Get event audit log |
| GET | /api/organizations/:orgId/audit | User+Owner | Get organization audit log |

## 4. Standard Response Format

### Success

```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error

```json
{
  "error": {
    "code": "TICKET_ALREADY_CHECKED_IN",
    "message": "This ticket has already been checked in.",
    "details": { ... }
  }
}
```

### Verification Response

```json
{
  "result": "VALID" | "ALREADY_CHECKED_IN" | "INVALID" | "REVOKED" | "WRONG_EVENT" | "EVENT_NOT_LIVE",
  "ticket": {
    "participant_name": "John Doe",
    "ticket_number": "TKT-8F29D1",
    "checked_in_at": "2024-01-15T10:30:00Z",
    "checked_in_by": "Staff Name"
  }
}
```

## 5. Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Not authorized for this resource |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Input validation failed |
| DUPLICATE_REGISTRATION | 409 | Email already registered |
| INVALID_STATE_TRANSITION | 400 | Event state change not allowed |
| TICKET_ALREADY_ISSUED | 409 | Ticket already exists |
| TICKET_ALREADY_CHECKED_IN | 409 | Already checked in |
| TICKET_REVOKED | 400 | Ticket has been revoked |
| EVENT_NOT_LIVE | 400 | Event is not in LIVE state |
| EVENT_NOT_ACCEPTING | 400 | Event not accepting registrations |
| VERIFIER_EXPIRED | 401 | Verifier session expired |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## 6. Pagination

List endpoints support cursor-based pagination:

```
GET /api/.../registrations?cursor=xxx&limit=50
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "xxx",
    "has_more": true
  }
}
```
