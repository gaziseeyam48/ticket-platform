# TODO

## Immediate (Phase 6 — Free Event Ticket Issuance)
- [ ] Unified issueTicket() service
- [ ] Cryptographic ticket token hashing & database storage
- [ ] QR code generation for tickets
- [ ] Transactional email dispatch via Resend
- [ ] Automatic ticket issuance hook on free registration

## Completed
- [x] Phase 1 — Foundation & Security Infrastructure
- [x] Phase 2 — Organization Authentication & Authorization
- [x] Phase 3 — Event Management
- [x] Phase 4 — Registration Form Builder
- [x] Phase 5 — Public Registration

## Upcoming
- [ ] Paid event & manual payment verification (Phase 7)
- [ ] Admin direct ticket issuance (Phase 8)

## Technical Debt
- (none yet)

## Known Issues
- (none yet)

## Research Needed
- [ ] Confirm Resend email template approach (React Email vs HTML)
- [ ] Evaluate QR scanning libraries for browser compatibility (html5-qrcode vs zxing)
- [ ] Confirm Supabase RLS policy strategy for multi-tenancy
