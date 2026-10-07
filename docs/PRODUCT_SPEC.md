# Product Specification

## 1. Product Overview

**TicketPlatform** is a secure, lean web application for organizations to create events, collect registrations, issue digital tickets with QR codes, and verify tickets at event entrances.

It is **not** a general event-management platform, marketplace, or social network.

### Core Flow

```
Organization → Event → Registration → Ticket → QR Verification → Check-in
```

## 2. Actors

### 2.1 Organization Owner (Authenticated)

Full access to the organization's resources.

**Capabilities:**
- Create, edit, publish, start, end events
- Configure registration forms
- Manage registrations
- Review and approve/reject payments
- Issue and revoke tickets
- Manage verification staff
- View check-in data and audit logs

### 2.2 Organization Admin (Authenticated)

Performs event-management operations according to assigned permissions. Same capabilities as Owner unless restricted.

### 2.3 Event Verifier (Temporary, Event-Scoped)

Receives temporary access for a **specific event only**.

**Can:**
- Access the verification interface for their assigned event
- Scan QR codes
- See verification results
- Perform ticket check-ins

**Cannot:**
- Create/edit events
- Access other events
- Issue or revoke tickets
- Edit registration forms
- Access organization settings or unrelated data

**Access automatically expires** when the event ends or when the verifier invitation expires.

### 2.4 Participant (Unauthenticated)

No account required.

**Can:**
- Open a registration URL
- Submit registration information
- Submit payment transaction information (paid events)
- Receive ticket by email
- Present QR code at event

## 3. Feature Specification

### 3.1 Event Management

| Feature | Description |
|---------|-------------|
| Create Event | Name, description, date/time, location, type (FREE/PAID), slug |
| Edit Event | Modify event details (restricted by state) |
| Event States | DRAFT → PUBLISHED → LIVE → ENDED; also CANCELLED |
| Event Slug | URL-friendly unique identifier for public access |
| Start Event | Transitions to LIVE, enables verification |
| End Event | Transitions to ENDED, disables verification |

### 3.2 Registration Form Builder

Organizations configure a dynamic registration form per event.

**Supported field types:**
- Text
- Email
- Phone
- Number
- Dropdown (with options)
- Radio (with options)
- Checkbox
- Long Text (textarea)

**Form capabilities:**
- Add, remove, edit fields
- Mark fields as required
- Configure labels and placeholder text
- Configure options (dropdown/radio)
- Reorder fields
- Form schema stored as JSON (not separate DB columns)

### 3.3 Public Registration

- Accessible at `/events/{slug}/register`
- No account required
- Server-side validation of all form inputs
- Rate limiting and anti-abuse protection
- Duplicate registration detection (by email per event)

### 3.4 Free Event Flow

```
Registration Submitted → Registration Accepted → Ticket Issued → Email Sent
```

Ticket is automatically issued upon successful registration.

### 3.5 Paid Event Flow

```
Registration Submitted → Payment Instructions Shown → Transaction ID Submitted
    → Admin Reviews → Approve & Issue Ticket → Email Sent
                     → Reject Payment
```

**Paid event configuration:**
- Payment method description
- Account number / payment details
- Amount
- Instructions text
- Transaction ID required from participant

**Registration states for paid events:**
- REGISTERED
- PAYMENT_SUBMITTED
- PAYMENT_APPROVED
- PAYMENT_REJECTED

### 3.6 Ticket Issuance

One unified `issueTicket()` service used by:
- Automatic issuance (free events)
- Approval-triggered issuance (paid events)
- Admin direct issuance

**Ticket contains:**
- Human-readable ticket ID (e.g., `TKT-8F29D1`)
- Cryptographically random opaque token (for QR)
- Server stores hash of token
- QR code encoding the token
- Event name, participant name, ticket type, date/time

**Idempotency:** Duplicate calls must not create multiple tickets.

### 3.7 Admin Direct Ticket Issuance

Admin enters participant info (name, email, phone, custom fields) and issues a ticket directly. Uses the same `issueTicket()` pipeline.

### 3.8 Ticket View

- Accessible at `/t/{public-ticket-token}`
- Displays: event name, participant name, ticket type, ticket ID, QR code, date/time, instructions
- Anti-enumeration protection (unpredictable tokens)
- No sensitive data exposed

### 3.9 Verification Staff Management

- Admin adds verifiers per event (name + email)
- Verifier receives secure magic link
- Session scoped to: organization_id, event_id, verifier_id, role=EVENT_VERIFIER, expires_at
- Access disabled when event ends

### 3.10 Ticket Verification & Check-in

**Mobile-first interface** for verifiers:
- Camera/QR scanner
- Clear result states: VALID, ALREADY CHECKED IN, INVALID, REVOKED, WRONG EVENT, VERIFICATION UNAVAILABLE

**Atomic check-in:** Concurrency-safe using database-level atomic operations. Only one successful check-in per ticket.

### 3.11 Participant & Ticket Management

Organization dashboard showing:
- Participant info, email, registration status
- Payment status, ticket status, issued date
- Check-in status and timestamp
- Actions: view ticket, issue ticket, revoke ticket, resend ticket, inspect details

### 3.12 Audit Logging

Tracked actions:
- EVENT_CREATED, EVENT_PUBLISHED, EVENT_STARTED, EVENT_ENDED
- REGISTRATION_CREATED
- PAYMENT_SUBMITTED, PAYMENT_APPROVED, PAYMENT_REJECTED
- TICKET_ISSUED, TICKET_REVOKED
- VERIFIER_CREATED, VERIFIER_INVITED
- TICKET_CHECKED_IN

Each record: event, organization, actor, action, timestamp, target, metadata.

### 3.13 Email

- Transactional email for ticket delivery
- Ticket creation and email delivery are separate concerns
- "Resend Ticket" action available (does not create new ticket)
- Graceful handling of email delivery failures

## 4. Explicit Non-Features

The following are explicitly **out of scope**:

- Attendee accounts / login / signup / dashboards
- Event discovery marketplace
- Ticket resale
- Seat maps / seating allocation
- Mobile applications
- Offline verification
- Automated payment gateway integration
- Complex accounting
- Chat / social features
- Coupon / loyalty / CRM systems
- Microservices architecture

## 5. Quality Attributes

| Attribute | Requirement |
|-----------|-------------|
| Security | Server-side auth/authz, atomic operations, token security |
| Reliability | Idempotent ticket issuance, email failure handling |
| Scalability | Thousands of participants per event, multiple verifiers |
| Usability | Mobile-first verification, fast scanning, clear UX |
| Maintainability | Strong typing, modular architecture, documentation |
| Auditability | All important actions logged |
