# Testing Strategy

## 1. Testing Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit and integration testing |
| React Testing Library | Component testing |
| Playwright | End-to-end testing |
| MSW (Mock Service Worker) | API mocking for integration tests |

## 2. Test Categories

### 2.1 Unit Tests

Test isolated business logic:
- Service functions (issueTicket, verifyTicket, etc.)
- Validation schemas (Zod)
- Utility functions (token generation, hashing, slug generation)
- State machine transitions

**Location:** `__tests__/unit/` or co-located `*.test.ts`

### 2.2 Integration Tests

Test service + database interactions:
- Registration flow (submit → validate → store)
- Ticket issuance (create → hash → store → email)
- Payment approval (approve → issue ticket)
- Verification flow (scan → validate → check-in)
- Authorization (org isolation, role enforcement)

**Location:** `__tests__/integration/`

### 2.3 End-to-End Tests

Test complete user flows through the browser:
- Organization signup → create event → publish
- Participant registration → receive ticket
- Payment flow → approval → ticket
- Verifier login → scan → check-in
- Event start → verification → event end

**Location:** `__tests__/e2e/`

### 2.4 Concurrency Tests

**Mandatory.** Test atomic check-in:
- Simulate N concurrent check-in requests for the same ticket
- Verify exactly 1 succeeds
- Verify N-1 receive ALREADY_CHECKED_IN

**Location:** `__tests__/concurrency/`

## 3. Critical Test Scenarios

### Authentication
- [ ] Signup creates user + organization
- [ ] Login returns valid session
- [ ] Logout invalidates session
- [ ] Unauthorized access returns 401
- [ ] Cross-organization access returns 403

### Events
- [ ] Create event (valid data)
- [ ] DRAFT → PUBLISHED (valid)
- [ ] DRAFT → LIVE (invalid, rejected)
- [ ] PUBLISHED → LIVE (valid)
- [ ] LIVE → ENDED (valid)
- [ ] ENDED → LIVE (invalid, rejected)
- [ ] Event belongs to correct organization

### Registration
- [ ] Free event: registration → auto ticket
- [ ] Paid event: registration → payment pending
- [ ] Duplicate email rejected
- [ ] Closed event rejected
- [ ] Invalid form data rejected
- [ ] Rate limited after threshold

### Tickets
- [ ] issueTicket creates ticket with hashed token
- [ ] Duplicate issuance prevented (idempotent)
- [ ] Admin issuance uses same pipeline
- [ ] Revocation changes status
- [ ] Revoked ticket cannot be checked in
- [ ] Resend does not create new ticket

### Payments
- [ ] Transaction ID submission
- [ ] Approval triggers ticket issuance
- [ ] Rejection updates status
- [ ] Cannot approve already-approved
- [ ] Cannot approve already-rejected (or can re-review — decide)

### Verification
- [ ] Valid ticket → VALID + checked in
- [ ] Already checked-in ticket → ALREADY_CHECKED_IN
- [ ] Invalid token → INVALID
- [ ] Revoked ticket → REVOKED
- [ ] Wrong event ticket → WRONG_EVENT
- [ ] Non-LIVE event → EVENT_NOT_LIVE
- [ ] Expired verifier → rejected
- [ ] Unauthorized verifier → rejected

### Concurrency (Mandatory)
- [ ] 10 concurrent check-in requests for same ticket
- [ ] Exactly 1 succeeds
- [ ] Remaining 9 return ALREADY_CHECKED_IN
- [ ] Exactly 1 checkin record in database

## 4. Test Data Strategy

- Use Supabase local development (or test database)
- Factory functions to create test data (organizations, events, tickets)
- Clean up after each test suite
- No shared mutable state between tests

## 5. CI/CD Integration

- Run unit tests on every push
- Run integration tests on every PR
- Run E2E tests before deployment
- Concurrency tests in integration test suite
