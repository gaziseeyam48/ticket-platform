# TODO

## Immediate (Phase 2 — Organization Authentication & Authorization)
- [ ] Configure Supabase Auth client & middleware session handlers
- [ ] Implement Organization Signup flow with automatic organization creation
- [ ] Implement Organization Login / Logout flows
- [ ] Implement Protected Dashboard Layout
- [ ] Implement Organization membership model (OWNER vs ADMIN roles)
- [ ] Implement strict organization-isolation checks on all queries
- [ ] Add unit and integration tests for authentication and authorization isolation

## Upcoming
- [ ] Build event management & state machine (Phase 3)
- [ ] Build registration form builder (Phase 4)
- [ ] Build public registration flow (Phase 5)
- [ ] Implement free event ticket issuance (Phase 6)

## Technical Debt
- (none yet)

## Known Issues
- (none yet)

## Research Needed
- [ ] Confirm Resend email template approach (React Email vs HTML)
- [ ] Evaluate QR scanning libraries for browser compatibility (html5-qrcode vs zxing)
- [ ] Confirm Supabase RLS policy strategy for multi-tenancy
