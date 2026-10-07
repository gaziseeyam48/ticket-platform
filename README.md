# TicketPlatform

> **Secure, Lean Event Ticket Generation & Atomic Verification Platform**

TicketPlatform is a production-quality, monolithic web application built for organizations to create events, configure dynamic registration forms, issue cryptographically signed digital tickets, and verify tickets at event entrances with concurrency-safe atomic check-in.

---

## 1. Core Mental Model

The entire platform operates strictly according to this unidirectional business flow:

```
Organization → Event → Registration → Ticket → QR Verification → Check-in
```

### Actors

- **Organization Owner / Admin**: Authenticated via Supabase Auth. Manages organization events, reviews payments, issues tickets, and controls event lifecycle.
- **Participant**: Completely unauthenticated (zero accounts, zero passwords). Registers via public slug URL and receives a secure digital ticket.
- **Event Verifier**: Granted temporary, scoped access to a specific event via magic links. Bounded strictly to verification; cannot access organization settings or attendee data.

---

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with custom dark mode design system
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (Organizations) + Scoped App JWTs (Verifiers)
- **Validation**: Zod
- **Testing**: Vitest for unit & concurrency testing
- **Email**: Resend (Transactional ticket delivery)

---

## 3. Getting Started

### Prerequisites

- Node.js `v20+` (tested with v24)
- npm `v10+`

### Environment Configuration

Copy the sample environment file and configure your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend operations) |
| `NEXT_PUBLIC_APP_URL` | Application base URL (`http://localhost:3000`) |
| `VERIFIER_JWT_SECRET` | 32+ character secret for scoped verifier sessions |
| `RESEND_API_KEY` | Transactional email provider key |

### Installation & Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm run test

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build
```

---

## 4. Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # UI design system and components
│   └── ui/               # Reusable primitives (Button, Card, Badge, Input)
├── lib/
│   ├── constants/        # Lifecycle states & domain enums
│   ├── db/               # Supabase clients (browser, server, admin)
│   ├── errors/           # Typed AppError & HTTP error codes
│   ├── types/            # TypeScript database and API schemas
│   ├── utils/            # Crypto, token generation, API response builders
│   └── validators/       # Zod validation schemas
└── __tests__/            # Vitest unit and integration suites
```

---

## 5. Architecture Documentation

Detailed architectural and design specifications are maintained in the `/docs` directory:

- [Product Specification](docs/PRODUCT_SPEC.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & Migrations](docs/DATABASE.md)
- [Security Model & Verification Protocol](docs/SECURITY.md)
- [API Design](docs/API.md)
- [Architectural Decision Records (ADR)](docs/DECISIONS.md)
- [Build Progress Tracker](docs/BUILD_PROGRESS.md)
- [Testing Strategy](docs/TESTING.md)
- [AI Session State](docs/AI_SESSION_STATE.md)
