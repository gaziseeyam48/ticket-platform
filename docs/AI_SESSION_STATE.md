# AI Session State

## Current Phase
PHASE 0

## Phase Status
COMPLETED

## Last Completed Task
Created all Phase 0 documentation: PRODUCT_SPEC.md, ARCHITECTURE.md, DATABASE.md, SECURITY.md, API.md, DECISIONS.md, BUILD_PROGRESS.md, TODO.md, TESTING.md

## Current Task
None — Phase 0 complete, awaiting instruction to continue to Phase 1.

## Next Task
Phase 1 — Project Foundation: Initialize Next.js, TypeScript, Tailwind CSS, Supabase client, project structure, error handling, basic UI.

## Completed Phases
- Phase 0: Discovery, Requirements & Architecture

## Current Architecture
- **Framework:** Next.js (App Router) with TypeScript
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth for org users; application-managed tokens for verifiers
- **Email:** Resend
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Hosting target:** Vercel
- **Pattern:** Monolithic full-stack application

## Important Decisions
- ADR-001: Monolithic Next.js (no microservices)
- ADR-002: Supabase for Auth + DB
- ADR-003: Verifier auth via app-managed magic link tokens (not Supabase Auth)
- ADR-004: SHA-256 hashed token storage for tickets and invitations
- ADR-005: Atomic check-in via DB transaction + UNIQUE constraint
- ADR-006: Registration form schema as JSONB
- ADR-007: Unified issueTicket() pipeline for all issuance paths
- ADR-008: Separate ticket creation and email delivery
- ADR-009: Event slugs globally unique
- ADR-010: Tailwind CSS for styling
- ADR-011: Resend for transactional email

## Known Bugs
None

## Known Limitations
None yet — project not started.

## Files Recently Changed
- docs/PRODUCT_SPEC.md (created)
- docs/ARCHITECTURE.md (created)
- docs/DATABASE.md (created)
- docs/SECURITY.md (created)
- docs/API.md (created)
- docs/DECISIONS.md (created)
- docs/BUILD_PROGRESS.md (created)
- docs/TODO.md (created)
- docs/TESTING.md (created)
- docs/AI_SESSION_STATE.md (created)

## Database Changes
None — schema designed but not yet applied.

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server only)
- `RESEND_API_KEY` — Resend API key
- `NEXT_PUBLIC_APP_URL` — Application base URL
- `VERIFIER_JWT_SECRET` — Secret for signing verifier session tokens

## Commands Used
None yet.

## Tests Passing
N/A — no tests yet.

## Tests Failing
N/A

## Git Commit
Pending — will commit after creating this file.

## Resume Instructions
1. Read this file.
2. Read BUILD_PROGRESS.md.
3. Inspect the current repository state.
4. Verify Phase 0 documentation is complete and consistent.
5. Continue with Phase 1 — Project Foundation.
