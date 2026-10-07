# Database Design

## 1. Entity-Relationship Diagram

```
┌────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  organizations │────<│ organization_    │     │    events        │
│                │     │ users            │     │                 │
│  id (PK)       │     │                 │     │  id (PK)        │
│  name          │     │  id (PK)        │     │  organization_id│──→ organizations
│  slug          │     │  organization_id│──→  │  name           │
│  created_at    │     │  user_id (FK→   │     │  slug           │
│  updated_at    │     │   auth.users)   │     │  description    │
└────────────────┘     │  role           │     │  status         │
                       │  created_at     │     │  event_type     │
                       └─────────────────┘     │  date_start     │
                                               │  date_end       │
                                               │  location       │
                                               │  payment_config │
                                               │  settings       │
                                               │  created_at     │
                                               │  updated_at     │
                                               └────────┬────────┘
                                                        │
                       ┌────────────────────────────────┼────────────────────────┐
                       │                                │                        │
              ┌────────▼─────────┐            ┌────────▼─────────┐     ┌────────▼──────────┐
              │ registration_   │            │    tickets        │     │ event_verifiers   │
              │ forms           │            │                   │     │                   │
              │                 │            │  id (PK)          │     │  id (PK)          │
              │  id (PK)        │            │  event_id (FK)    │     │  event_id (FK)    │
              │  event_id (FK)  │            │  registration_id  │     │  organization_id  │
              │  fields (JSONB) │            │  ticket_number    │     │  name             │
              │  created_at     │            │  token_hash       │     │  email            │
              │  updated_at     │            │  status           │     │  invitation_token │
              └────────┬────────┘            │  participant_name │     │  status           │
                       │                     │  participant_email│     │  expires_at       │
              ┌────────▼─────────┐           │  issued_by        │     │  created_at       │
              │  registrations   │           │  issued_at        │     └───────────────────┘
              │                  │           │  revoked_at       │
              │  id (PK)         │           │  created_at       │
              │  event_id (FK)   │──────────▶│                   │
              │  form_id (FK)    │           └────────┬──────────┘
              │  email           │                    │
              │  status          │           ┌────────▼──────────┐
              │  form_data(JSONB)│           │   checkins        │
              │  payment_status  │           │                   │
              │  transaction_id  │           │  id (PK)          │
              │  payment_        │           │  ticket_id (FK)   │
              │   reviewed_by    │           │  event_id (FK)    │
              │  payment_        │           │  verifier_id (FK) │
              │   reviewed_at    │           │  checked_in_at    │
              │  created_at      │           │  created_at       │
              │  updated_at      │           └───────────────────┘
              └──────────────────┘
                                             ┌───────────────────┐
                                             │   audit_logs      │
                                             │                   │
                                             │  id (PK)          │
                                             │  organization_id  │
                                             │  event_id         │
                                             │  actor_id         │
                                             │  actor_type       │
                                             │  action           │
                                             │  target_type      │
                                             │  target_id        │
                                             │  metadata (JSONB) │
                                             │  created_at       │
                                             └───────────────────┘
```

## 2. Table Definitions

### 2.1 `organizations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NOT NULL | Organization name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### 2.2 `organization_users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| organization_id | UUID | FK → organizations(id), NOT NULL | Organization reference |
| user_id | UUID | FK → auth.users(id), NOT NULL | Supabase auth user |
| role | VARCHAR(20) | NOT NULL, CHECK (role IN ('OWNER', 'ADMIN')) | User role in organization |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique constraint:** `(organization_id, user_id)`

### 2.3 `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| organization_id | UUID | FK → organizations(id), NOT NULL | Owning organization |
| name | VARCHAR(255) | NOT NULL | Event name |
| slug | VARCHAR(100) | NOT NULL | URL-friendly identifier |
| description | TEXT | | Event description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT', CHECK | Event lifecycle state |
| event_type | VARCHAR(10) | NOT NULL, CHECK (event_type IN ('FREE', 'PAID')) | Free or paid |
| date_start | TIMESTAMPTZ | | Event start date/time |
| date_end | TIMESTAMPTZ | | Event end date/time |
| location | VARCHAR(500) | | Event location |
| payment_config | JSONB | | Payment instructions (paid events) |
| settings | JSONB | NOT NULL, DEFAULT '{}' | Additional settings |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique constraint:** `(organization_id, slug)`

**Check constraint on status:** `status IN ('DRAFT', 'PUBLISHED', 'LIVE', 'ENDED', 'CANCELLED')`

**`payment_config` structure (for PAID events):**
```json
{
  "payment_method": "Bank Transfer",
  "account_number": "1234567890",
  "account_name": "Organization Inc.",
  "amount": "50.00",
  "currency": "USD",
  "instructions": "Transfer exact amount and note your email as reference."
}
```

### 2.4 `registration_forms`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| event_id | UUID | FK → events(id), NOT NULL, UNIQUE | One form per event |
| fields | JSONB | NOT NULL, DEFAULT '[]' | Array of field definitions |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**`fields` structure:**
```json
[
  {
    "id": "field_abc123",
    "type": "text",
    "label": "Full Name",
    "required": true,
    "placeholder": "Enter your full name",
    "order": 0
  },
  {
    "id": "field_def456",
    "type": "email",
    "label": "Email Address",
    "required": true,
    "placeholder": "your@email.com",
    "order": 1
  },
  {
    "id": "field_ghi789",
    "type": "dropdown",
    "label": "T-Shirt Size",
    "required": false,
    "options": ["S", "M", "L", "XL"],
    "order": 2
  }
]
```

### 2.5 `registrations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| event_id | UUID | FK → events(id), NOT NULL | Event reference |
| form_id | UUID | FK → registration_forms(id), NOT NULL | Form used |
| email | VARCHAR(255) | NOT NULL | Participant email (normalized) |
| participant_name | VARCHAR(255) | NOT NULL | Participant display name |
| status | VARCHAR(30) | NOT NULL, DEFAULT 'REGISTERED' | Registration status |
| form_data | JSONB | NOT NULL | Submitted form values |
| payment_status | VARCHAR(30) | | Payment status (paid events) |
| transaction_id | VARCHAR(255) | | Payment transaction reference |
| payment_reviewed_by | UUID | FK → auth.users(id) | Admin who reviewed |
| payment_reviewed_at | TIMESTAMPTZ | | Review timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique constraint:** `(event_id, email)` — one registration per email per event

**Check constraint on status:** `status IN ('REGISTERED', 'CANCELLED')`

**Check constraint on payment_status:** `payment_status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')`

**`form_data` structure:**
```json
{
  "field_abc123": "John Doe",
  "field_def456": "john@example.com",
  "field_ghi789": "L"
}
```

### 2.6 `tickets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| event_id | UUID | FK → events(id), NOT NULL | Event reference |
| registration_id | UUID | FK → registrations(id) | Registration reference (null for admin-issued) |
| ticket_number | VARCHAR(20) | NOT NULL, UNIQUE | Human-readable ticket ID (e.g., TKT-8F29D1) |
| token_hash | VARCHAR(128) | NOT NULL, UNIQUE | SHA-256 hash of ticket token |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ISSUED' | Ticket status |
| participant_name | VARCHAR(255) | NOT NULL | Participant name |
| participant_email | VARCHAR(255) | NOT NULL | Participant email |
| participant_data | JSONB | | Additional participant data |
| issued_by | UUID | FK → auth.users(id) | Admin who issued (null = automatic) |
| issued_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When issued |
| checked_in_at | TIMESTAMPTZ | | When checked in |
| checked_in_by | UUID | | Verifier who checked in |
| revoked_at | TIMESTAMPTZ | | When revoked |
| revoked_by | UUID | FK → auth.users(id) | Admin who revoked |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Check constraint on status:** `status IN ('ISSUED', 'CHECKED_IN', 'REVOKED')`

**Token flow:**
1. Generate 32-byte cryptographically random token
2. Base64url-encode for URL/QR use → this is the public token
3. SHA-256 hash the token → store `token_hash` in database
4. The public token is used in the QR code and ticket URL: `/t/{public_token}`
5. On verification, hash the presented token and look up by `token_hash`

### 2.7 `event_verifiers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| event_id | UUID | FK → events(id), NOT NULL | Event reference |
| organization_id | UUID | FK → organizations(id), NOT NULL | Organization reference |
| name | VARCHAR(255) | NOT NULL | Verifier display name |
| email | VARCHAR(255) | NOT NULL | Verifier email |
| invitation_token_hash | VARCHAR(128) | UNIQUE | Hash of invitation token |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'INVITED' | Verifier status |
| expires_at | TIMESTAMPTZ | NOT NULL | When access expires |
| last_accessed_at | TIMESTAMPTZ | | Last verification activity |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique constraint:** `(event_id, email)` — one verifier invitation per email per event

**Check constraint on status:** `status IN ('INVITED', 'ACTIVE', 'EXPIRED', 'REVOKED')`

### 2.8 `checkins`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| ticket_id | UUID | FK → tickets(id), NOT NULL, UNIQUE | Ticket reference (one check-in per ticket) |
| event_id | UUID | FK → events(id), NOT NULL | Event reference |
| verifier_id | UUID | FK → event_verifiers(id), NOT NULL | Verifier who performed check-in |
| checked_in_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Check-in timestamp |

**Unique constraint on ticket_id** enforces one check-in per ticket at the database level.

### 2.9 `audit_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| organization_id | UUID | FK → organizations(id) | Organization context |
| event_id | UUID | FK → events(id) | Event context |
| actor_id | VARCHAR(255) | | Who performed the action |
| actor_type | VARCHAR(20) | NOT NULL | 'USER', 'VERIFIER', 'SYSTEM' |
| action | VARCHAR(50) | NOT NULL | Action identifier |
| target_type | VARCHAR(50) | | Target entity type |
| target_id | VARCHAR(255) | | Target entity ID |
| metadata | JSONB | | Additional context |
| ip_address | INET | | Request IP |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When it happened |

## 3. Indexes

### Critical Indexes

```sql
-- Organization lookup
CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX idx_organization_users_org_id ON organization_users(organization_id);

-- Event lookup by slug (public access)
CREATE UNIQUE INDEX idx_events_org_slug ON events(organization_id, slug);

-- Registration lookup
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE UNIQUE INDEX idx_registrations_event_email ON registrations(event_id, email);

-- Ticket lookup (verification - most performance-critical)
CREATE UNIQUE INDEX idx_tickets_token_hash ON tickets(token_hash);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX idx_tickets_registration_id ON tickets(registration_id);

-- Verifier lookup
CREATE INDEX idx_event_verifiers_event_id ON event_verifiers(event_id);
CREATE UNIQUE INDEX idx_event_verifiers_event_email ON event_verifiers(event_id, email);
CREATE UNIQUE INDEX idx_event_verifiers_invitation_token ON event_verifiers(invitation_token_hash)
    WHERE invitation_token_hash IS NOT NULL;

-- Check-in lookup
CREATE UNIQUE INDEX idx_checkins_ticket_id ON checkins(ticket_id);
CREATE INDEX idx_checkins_event_id ON checkins(event_id);

-- Audit log lookup
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## 4. Row-Level Security (RLS) Considerations

Supabase RLS will enforce organization-level isolation at the database level:

- **organizations**: Users can only read organizations they belong to
- **events**: Users can only access events belonging to their organization
- **registrations**: Scoped to organization's events
- **tickets**: Scoped to organization's events
- **audit_logs**: Scoped to organization

RLS policies will be defined in Phase 2 (Authentication & Authorization).

For **service-role operations** (ticket issuance, verification), use the Supabase service role key which bypasses RLS.

## 5. Data Integrity Constraints

```sql
-- Ticket check-in atomic operation
-- This ensures only one check-in per ticket at the database level:
ALTER TABLE checkins ADD CONSTRAINT unique_ticket_checkin UNIQUE (ticket_id);

-- Event type consistency
-- Payment config should exist for paid events (enforced at application level)

-- Registration uniqueness
ALTER TABLE registrations ADD CONSTRAINT unique_event_email UNIQUE (event_id, email);

-- Verifier uniqueness
ALTER TABLE event_verifiers ADD CONSTRAINT unique_event_verifier_email UNIQUE (event_id, email);
```

## 6. Migration Strategy

Migrations will be managed as numbered SQL files:

```
lib/db/migrations/
├── 001_create_organizations.sql
├── 002_create_events.sql
├── 003_create_registration_forms.sql
├── 004_create_registrations.sql
├── 005_create_tickets.sql
├── 006_create_event_verifiers.sql
├── 007_create_checkins.sql
├── 008_create_audit_logs.sql
└── 009_create_indexes.sql
```

Each migration is idempotent and can be applied in order.
