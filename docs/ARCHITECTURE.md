# System Architecture

## 1. Architecture Overview

**Type:** Monolithic full-stack web application  
**Framework:** Next.js (App Router) with TypeScript  
**Database:** PostgreSQL via Supabase  
**Auth:** Supabase Auth  
**Hosting:** Vercel  
**Email:** Resend  

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    NEXT.JS APP                       │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  App Router   │  │  API Routes  │  │  Server    │ │
│  │  (Pages/UI)   │  │  (/api/*)    │  │  Actions   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
│         │                 │                  │       │
│  ┌──────┴─────────────────┴──────────────────┴─────┐ │
│  │              SERVICE LAYER                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │
│  │  │  Event   │ │  Ticket  │ │  Registration    │ │ │
│  │  │  Service │ │  Service │ │  Service         │ │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │
│  │  │  Auth    │ │  Verify  │ │  Email           │ │ │
│  │  │  Service │ │  Service │ │  Service         │ │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐                      │ │
│  │  │  Audit   │ │  Payment │                      │ │
│  │  │  Service │ │  Service │                      │ │
│  │  └──────────┘ └──────────┘                      │ │
│  └─────────────────────┬───────────────────────────┘ │
│                        │                             │
│  ┌─────────────────────┴───────────────────────────┐ │
│  │              DATA ACCESS LAYER                   │ │
│  │         Supabase Client (server-side)            │ │
│  └─────────────────────┬───────────────────────────┘ │
└────────────────────────┼─────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │     SUPABASE        │
              │  ┌──────────────┐   │
              │  │  PostgreSQL  │   │
              │  └──────────────┘   │
              │  ┌──────────────┐   │
              │  │  Supabase    │   │
              │  │  Auth        │   │
              │  └──────────────┘   │
              │  ┌──────────────┐   │
              │  │  Row-Level   │   │
              │  │  Security    │   │
              │  └──────────────┘   │
              └─────────────────────┘

              ┌─────────────────────┐
              │      RESEND         │
              │  (Transactional     │
              │   Email)            │
              └─────────────────────┘
```

## 2. Application Layer Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── (dashboard)/              # Authenticated org dashboard
│   │   ├── org/[orgId]/          # Organization-scoped pages
│   │   │   ├── events/           # Event management
│   │   │   ├── settings/         # Org settings
│   │   │   └── ...
│   ├── (public)/                 # Public routes (no auth)
│   │   ├── events/[slug]/        # Public event page
│   │   │   └── register/         # Registration form
│   │   └── t/[token]/            # Ticket view
│   ├── (verify)/                 # Verifier routes
│   │   └── verify/[eventId]/     # Verification interface
│   ├── api/                      # API routes
│   │   ├── auth/                 # Auth endpoints
│   │   ├── events/               # Event endpoints
│   │   ├── registrations/        # Registration endpoints
│   │   ├── tickets/              # Ticket endpoints
│   │   ├── verify/               # Verification endpoints
│   │   └── webhooks/             # Webhook handlers
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── lib/                          # Core library code
│   ├── services/                 # Business logic services
│   │   ├── event.service.ts
│   │   ├── ticket.service.ts
│   │   ├── registration.service.ts
│   │   ├── verification.service.ts
│   │   ├── payment.service.ts
│   │   ├── email.service.ts
│   │   └── audit.service.ts
│   ├── db/                       # Database layer
│   │   ├── client.ts             # Supabase client setup
│   │   ├── queries/              # Query functions
│   │   └── migrations/           # SQL migrations
│   ├── auth/                     # Auth utilities
│   │   ├── session.ts
│   │   ├── guards.ts
│   │   └── permissions.ts
│   ├── validators/               # Zod schemas
│   │   ├── event.schema.ts
│   │   ├── registration.schema.ts
│   │   ├── ticket.schema.ts
│   │   └── ...
│   ├── types/                    # TypeScript types
│   │   ├── database.types.ts     # Generated DB types
│   │   ├── event.types.ts
│   │   ├── ticket.types.ts
│   │   └── ...
│   ├── errors/                   # Error handling
│   │   ├── app-error.ts
│   │   └── error-codes.ts
│   ├── utils/                    # Shared utilities
│   │   ├── crypto.ts             # Token generation
│   │   ├── qr.ts                 # QR code generation
│   │   └── ...
│   └── constants/                # Application constants
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── dashboard/                # Dashboard components
│   ├── events/                   # Event components
│   ├── tickets/                  # Ticket components
│   ├── verification/             # Verification components
│   └── shared/                   # Shared components
│
├── hooks/                        # Custom React hooks
│
└── styles/                       # Global styles
```

## 3. Authentication Architecture

### Organization Users (Supabase Auth)

```
Signup → Supabase creates auth.users record
      → Application creates organizations record
      → Application creates organization_users record (role: OWNER)
      → Session issued via Supabase Auth (JWT)
```

### Verifiers (Magic Link / Token-based)

```
Admin creates verifier → generates secure invitation token
                       → sends email with magic link
Verifier clicks link   → validates token + event_id + expiry
                       → creates scoped session (cookie/JWT)
                       → session contains: org_id, event_id, verifier_id, role, expires_at
```

**Verifier sessions are NOT Supabase Auth sessions.** They are application-managed, event-scoped tokens stored in a secure HTTP-only cookie or short-lived JWT.

### Participants (Unauthenticated)

No auth. Public endpoints serve registration forms and ticket views.

## 4. Authorization Model

```
┌─────────────────┐
│  Request         │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Is Auth  │──── No ──→ Public endpoint? ──── Yes ──→ Allow
    │ Required?│                                  No  ──→ 401
    └────┬────┘
         │ Yes
    ┌────▼──────────┐
    │ Valid Session? │──── No ──→ 401
    └────┬──────────┘
         │ Yes
    ┌────▼──────────────┐
    │ Is Verifier?       │──── Yes ──→ Check verifier scope
    │                    │            (event_id, expires_at, event.status)
    └────┬──────────────┘
         │ No (Org user)
    ┌────▼──────────────┐
    │ Belongs to Org?    │──── No ──→ 403
    └────┬──────────────┘
         │ Yes
    ┌────▼──────────────┐
    │ Has Permission?    │──── No ──→ 403
    └────┬──────────────┘
         │ Yes
         ▼
       Allow
```

### Permission Matrix

| Action | Owner | Admin | Verifier | Participant |
|--------|-------|-------|----------|-------------|
| Create event | ✓ | ✓ | ✗ | ✗ |
| Edit event | ✓ | ✓ | ✗ | ✗ |
| Start/End event | ✓ | ✓ | ✗ | ✗ |
| Configure form | ✓ | ✓ | ✗ | ✗ |
| View registrations | ✓ | ✓ | ✗ | ✗ |
| Approve payments | ✓ | ✓ | ✗ | ✗ |
| Issue tickets | ✓ | ✓ | ✗ | ✗ |
| Revoke tickets | ✓ | ✓ | ✗ | ✗ |
| Manage verifiers | ✓ | ✓ | ✗ | ✗ |
| Scan & verify tickets | ✗ | ✗ | ✓ (own event) | ✗ |
| Register for event | ✗ | ✗ | ✗ | ✓ |
| View own ticket | ✗ | ✗ | ✗ | ✓ |
| Manage org settings | ✓ | ✗ | ✗ | ✗ |
| Manage org members | ✓ | ✗ | ✗ | ✗ |

## 5. State Machines

### Event Lifecycle

```
DRAFT ──→ PUBLISHED ──→ LIVE ──→ ENDED
  │           │
  └───────────┴──────────────→ CANCELLED
```

**Valid transitions:**
| From | To | Trigger |
|------|----|---------|
| DRAFT | PUBLISHED | Publish event (requires form configured) |
| DRAFT | CANCELLED | Cancel event |
| PUBLISHED | LIVE | Start event |
| PUBLISHED | CANCELLED | Cancel event |
| LIVE | ENDED | End event |

**Registration acceptance:**
- PUBLISHED: accepting registrations
- LIVE: accepting registrations (configurable)
- All other states: NOT accepting registrations

### Registration Lifecycle (Free Event)

```
REGISTERED ──→ (automatic ticket issuance)
```

### Registration Lifecycle (Paid Event)

```
REGISTERED ──→ PAYMENT_SUBMITTED ──→ PAYMENT_APPROVED ──→ (ticket issued)
                                  ──→ PAYMENT_REJECTED
```

### Ticket Lifecycle

```
ISSUED ──→ CHECKED_IN
       ──→ REVOKED
```

## 6. Key External Services

| Service | Purpose | Failure Strategy |
|---------|---------|------------------|
| Supabase Auth | Organization user authentication | Auth unavailable = app unavailable |
| Supabase PostgreSQL | Data storage | DB unavailable = app unavailable |
| Resend | Transactional email | Ticket created even if email fails; resend available |

## 7. Security Architecture

See [SECURITY.md](./SECURITY.md) for full security documentation.

Key principles:
- Backend is the source of truth
- Never trust frontend state, QR payload, client timestamps
- Server-side validation on every mutation
- Organization isolation enforced at query level
- Atomic check-in operations
- Cryptographically secure ticket tokens
- Hashed token storage

## 8. Deployment Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel     │────▶│  Supabase   │     │   Resend    │
│  (Next.js)   │     │  (DB+Auth)  │     │   (Email)   │
│              │────▶│             │     │             │
│  Edge/Node   │     │ PostgreSQL  │     │             │
│  Functions   │──────────────────────▶ │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Vercel**: Hosts Next.js app, serves static assets, runs API routes and server actions
- **Supabase**: Managed PostgreSQL + Auth + Row-Level Security
- **Resend**: Transactional email delivery
