# Interactive Event Creation Walkthrough Documentation

## 1. Overview
TicketKoi includes a native, state-aware, route-conscious interactive product walkthrough that guides organizers through creating their event, configuring its registration form, and managing post-creation operational setup.

The walkthrough is implemented natively without third-party dependencies, adhering strictly to TicketKoi's design system tokens, WCAG 2.2 AA accessibility standards, responsive positioning, and keyboard navigation.

---

## 2. User Journey Mapping

### Journey A: Registration Form Builder (`/org/events/[id]/form?onboarding=1`)
Immediately following successful event creation, eligible organizers are automatically navigated to their registration form builder:

1. **Step 1 — Introduce Registration Form** (`form_intro`):
   - **Target:** `[data-tour="form-builder-heading"]`
   - **Guidance:** Explains the purpose of attendee registration data collection and system field constraints.
2. **Step 2 — Explain Form Outline** (`form_outline`):
   - **Target:** `[data-tour="form-outline"]`
   - **Guidance:** Outlines default system-required fields (Full Name, Email) and draggable card sorting order.
3. **Step 3 — Guide Field Creation** (`form_add_field`):
   - **Target:** `[data-tour="add-field-button"]`
   - **Guidance:** Guides the organizer to click "Add field" to choose custom questions (Phone, Dropdown, Checkbox, etc.) or continue if sufficient.
4. **Step 4 — Explain Field Configuration** (`form_field_config`):
   - **Target:** `[data-tour="field-config-panel"]`
   - **Guidance:** Details question labels, placeholder text, options, and required question toggles.
5. **Step 5 — Preview Attendee Experience** (`form_preview`):
   - **Target:** `[data-tour="preview-button"]`
   - **Guidance:** Demonstrates live attendee preview toggle without destroying draft state or issuing dummy tickets.
6. **Step 6 — Build Your Form & Save When Ready** (`form_save`):
   - **Target:** `[data-tour="save-form-button"]`
   - **Guidance:** Informs the organizer that they now have full freedom to build their form, add questions, and customize settings. The walkthrough popover closes when they click "Start Building", so it never obstructs their work.
   - **Transition:** Whenever the organizer saves their form for the first time (via "Save changes" or "Save & Continue to Setup"), Journey B (Event Setup in the workspace) automatically begins!

---

### Journey B: Event Workspace & Next Steps (`/org/events/[id]?onboarding=1`)
After the form is saved, the walkthrough navigates to the event workspace:

7. **Step 7 — Review Event Details** (`workspace_review`):
   - **Target:** `[data-tour="event-parameters"]`
   - **Guidance:** Explains schedule, venue, admission model, and highlights the public event slug (`/events/[slug]`).
8. **Step 8 — Understand Current Event Status** (`workspace_status`):
   - **Target:** `[data-tour="lifecycle-panel"]`
   - **Guidance:** Dynamically responds to event status:
     - `DRAFT`: Explains publishing requirements.
     - `PUBLISHED`: Confirms public attendee signups are live.
     - `LIVE`: Confirms gate scanning verification is active.
9. **Step 9 — Ticket Issuance & Admission Model** (`workspace_tickets`):
   - **Target:** `[data-tour="ticket-metrics"]`
   - **Guidance:** Dynamically describes admission rules:
     - `FREE`: Explains instant QR code ticket generation upon registration.
     - `PAID`: Explains manual attendee payment review & ticket issuance via Payments tab.
10. **Step 10 — Event Management & Operations** (`workspace_management`):
    - **Target:** `[data-tour="workspace-tabs"]`
    - **Guidance:** Explains Registrations, Tickets, Payments, and Gate Verifiers tabs.
11. **Completion Dialog** (`journey_completed`):
    - Contextual completion modal providing actions to view the public page (if published/live) or explore the workspace.

---

## 3. Configuration & Mode Switching

The walkthrough supports two distinct operating modes configured via environment variables:

```env
# In .env.local or platform environment settings:
NEXT_PUBLIC_ONBOARDING_MODE=every_event
```

### Testing Mode (`every_event` — Default)
- Starts automatically for **every newly created event**, even when the organization already has other events.
- Allows repeated end-to-end testing without resetting accounts or wiping database records.
- Each event maintains completely independent progress in its `events.settings.onboarding` record.

### Production Mode (`first_event`)
- Switch mode by setting:
  ```env
  NEXT_PUBLIC_ONBOARDING_MODE=first_event
  ```
- Uses a **server-authoritative check** of the organization's event count.
- **Server Rule for Deleted Events:** Evaluates active events for the organization. If an organization deleted prior test events and currently has 0 active events, their next created event will trigger the walkthrough for their first real event. If they already have 1 or more active events, the walkthrough is bypassed and standard post-creation navigation (`/org/events/[id]`) is preserved.

---

## 4. Replaying a Test Journey Safely

Developers and testers can safely replay the walkthrough for any event at any time:

1. **Workspace Header Button:**
   - In the event workspace (`/org/events/[id]`), click the **`Replay Tour`** button in the header action bar.
2. **Programmatic / Server Action:**
   - Call `resetOnboarding(eventId)` from `@/app/actions/onboarding.actions`.
   - This resets `events.settings.onboarding` to `status: "in_progress"` and redirects to `/org/events/[id]/form?onboarding=1`.
   - It is 100% non-destructive and preserves all event details, form fields, and registrations.

---

## 5. Architecture & State Persistence

- **State Storage:** Persisted in `events.settings->'onboarding'` using PostgreSQL JSONB with server-side authorization:
  ```json
  {
    "version": 1,
    "status": "in_progress",
    "currentStep": "form_intro",
    "completedSteps": ["form_intro", "form_outline"],
    "isSaved": false,
    "createdAt": "2026-10-17T00:15:00.000Z",
    "updatedAt": "2026-10-17T00:15:30.000Z"
  }
  ```
- **Context & Components:**
  - `src/lib/onboarding/types.ts`: TypeScript schemas for steps, modes, state, and dynamic contexts.
  - `src/lib/onboarding/config.ts`: Step definitions, copy, placement, and journey orders.
  - `src/lib/onboarding/server.ts`: Server-side mode resolution and authoritative eligibility logic.
  - `src/app/actions/onboarding.actions.ts`: Secure server actions for progress tracking, completion, dismissal, and developer replay.
  - `src/components/onboarding/tour-spotlight.tsx`: Native spotlight overlay with smooth viewport cutout.
  - `src/components/onboarding/tour-popover.tsx`: Floating card with automatic viewport bounds clamping and keyboard navigation.
  - `src/components/onboarding/tour-completion-dialog.tsx`: Compact completion state.
  - `src/components/onboarding/onboarding-provider.tsx`: Context provider mounted in `OrgShell`.

---

## 6. Accessibility & Usability (WCAG 2.2 AA)

- **Keyboard Controls:** `Escape` (Exit), `ArrowRight` (Next), `ArrowLeft` (Back), `Tab` (Focus navigation).
- **Focus Indicator:** Visible focus rings on all interactive tour controls (`ring-2 ring-[#0284C7]`).
- **Screen Readers:** ARIA live region announcements (`aria-live="polite"`), `role="dialog"`, `aria-labelledby`, `aria-describedby`.
- **Reduced Motion:** Adheres to user `prefers-reduced-motion` settings.
- **Responsive:** Automatically repositions and clamps popover within mobile and desktop viewports.
