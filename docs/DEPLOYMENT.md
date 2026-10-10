# Production Deployment Guide

This guide details the end-to-end instructions for deploying **TicketPlatform** to production using Supabase and Vercel.

---

## 1. Architecture & Prerequisites

- **Frontend & API**: Next.js 15 (App Router with Server Actions)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **Email Delivery**: Resend API
- **Hosting Environment**: Vercel (Edge / Serverless Node runtime)

---

## 2. Supabase Database Setup

1. Create a new Supabase project at [database.new](https://database.new).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Apply the migrations in sequential order:
   - **Step 1**: Run [`supabase/migrations/0001_initial_schema.sql`](file:///d:/ticket-platform/supabase/migrations/0001_initial_schema.sql)
   - **Step 2**: Run [`supabase/migrations/0002_fix_rls_recursion.sql`](file:///d:/ticket-platform/supabase/migrations/0002_fix_rls_recursion.sql)
   - **Step 3**: Run [`supabase/migrations/0003_performance_indexes.sql`](file:///d:/ticket-platform/supabase/migrations/0003_performance_indexes.sql)
4. Confirm in the **Table Editor** that the following tables exist:
   - `organizations`
   - `organization_users`
   - `events`
   - `registration_forms`
   - `registrations`
   - `tickets`
   - `event_verifiers`
   - `checkins`
   - `audit_logs`

---

## 3. Environment Variables

Configure the following environment variables in your Vercel Project Settings or `.env.local`:

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL | **Yes** | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anonymous Key | **Yes** | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Server-Only) | **Yes** | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | Public canonical base URL | **Yes** | `https://tickets.yourdomain.com` |
| `VERIFIER_JWT_SECRET` | HMAC Secret for verifier sessions ($\ge 32$ chars) | **Yes** | `e7b92f44...` |
| `RESEND_API_KEY` | Resend API credential for ticket dispatch | Optional | `re_abc123...` |
| `EMAIL_FROM` | Outgoing email sender header | Optional | `Ticket Platform <tickets@yourdomain.com>` |

---

## 4. Vercel Deployment Steps

1. Import your repository into **Vercel**.
2. Select the Next.js preset.
3. Paste all environment variables from Section 3.
4. Set Build Command: `npm run build`
5. Output Directory: `.next`
6. Click **Deploy**.

---

## 5. Post-Deployment Smoke Test Checklist

- [ ] **Organization Sign Up / Login**: Register a test organizer account at `/login`.
- [ ] **Event Creation**: Create an event in `/org/events/new` and configure a custom question.
- [ ] **Event Publishing**: Publish the event from DRAFT to PUBLISHED.
- [ ] **Attendee Registration**: Visit the public event URL `/events/[slug]`, submit registration, and verify digital pass generation.
- [ ] **Turnstile Verification**: Transition the event to LIVE, open `/verify`, scan or enter the pass token, and ensure valid check-in with duplicate scan prevention.
- [ ] **Audit Trail Inspection**: Check `/org/audit-logs` to confirm compliance audit records were captured.
