# Design System Specification

## 1. Overview & Visual Principles

The TicketPlatform design system is crafted for high-performance event operations, ticket distribution, and atomic gate verification. It balances an **editorial aesthetic** on public-facing surfaces with a **high-density, operational dashboard interface** inspired by modern SaaS management platforms (Sparlink, FlowMail, AutomatePro, Shiptrack, and ofspace).

### Core Principles
- **Clarity Over Decoration**: Clean structural hierarchy, minimal shadows, crisp borders, and zero gratuitous gradients.
- **High Data Density**: Compact tables, tight vertical rhythm, and legible data visualization designed for rapid administrative scanning.
- **Domain Fidelity**: Strictly event ticketing workflows—no placeholder marketing or ecommerce artifacts.
- **Responsive Architecture**: Universal usability across desktop multi-column layouts and single-thumb mobile scanning workflows.
- **Light Mode Foundation**: Warm off-white canvases (`#fbfbf9`), pure white cards (`#ffffff`), and high-contrast typography (`zinc-900`).

---

## 2. Design Tokens

### 2.1 Color Palette

| Token Role | Hex / Class | Purpose |
|---|---|---|
| **Canvas Background** | `#fbfbf9` (`bg-[#fbfbf9]`) | Warm paper canvas for public pages & dashboard shell |
| **Surface (Card/Modal)** | `#ffffff` (`bg-white`) | Component surface for cards, tables, popovers |
| **Surface Subtle** | `#f4f4f5` (`bg-zinc-100`) | Secondary containers, table headers, icon wrappers |
| **Surface Muted** | `#fafafa` (`bg-zinc-50`) | Hover states, alternating rows, input disabled backgrounds |
| **Border Default** | `#e4e4e7` (`border-zinc-200`) | Card borders, table dividers, input borders |
| **Border Subtle** | `#f4f4f5` (`border-zinc-100`) | Internal card dividers, table inner cell lines |
| **Border Active** | `#71717a` (`border-zinc-500`) | Focus rings, selected state borders |
| **Text Primary** | `#18181b` (`text-zinc-900`) | Main headings, primary table data, metric numbers |
| **Text Secondary** | `#52525b` (`text-zinc-600`) | Body descriptions, secondary labels, table headers |
| **Text Muted** | `#71717a` (`text-zinc-500`) | Timestamps, microcopy, helper hints |
| **Text Subtle** | `#a1a1aa` (`text-zinc-400`) | Monospace token IDs, placeholders, inactive icons |

#### Semantic Status Tokens
- **Live / Valid / Success**:
  - Background: `bg-emerald-50` (`#ecfdf5`)
  - Border: `border-emerald-200` (`#a7f3d0`)
  - Foreground: `text-emerald-700` (`#047857`)
  - Indicator: `bg-emerald-500`
- **Published / Informational**:
  - Background: `bg-sky-50` (`#f0f9ff`)
  - Border: `border-sky-200` (`#bae6fd`)
  - Foreground: `text-sky-700` (`#0369a1`)
  - Indicator: `bg-sky-500`
- **Draft / Pending / Warning**:
  - Background: `bg-amber-50` (`#fffbeb`)
  - Border: `border-amber-200` (`#fde68a`)
  - Foreground: `text-amber-700` (`#b45309`)
  - Indicator: `bg-amber-500`
- **Revoked / Cancelled / Destructive**:
  - Background: `bg-rose-50` (`#fff1f2`)
  - Border: `border-rose-200` (`#fecdd3`)
  - Foreground: `text-rose-700` (`#be123c`)
  - Indicator: `bg-rose-500`

---

### 2.2 Global Typography System

The TicketKoi design system establishes a deliberate, readable B2B SaaS typography hierarchy powered by **Inter** for all UI surfaces and **JetBrains Mono** strictly reserved for technical tokens.

- **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, Roboto, sans-serif. Used consistently across all dashboard headings, navigation, metric cards, tables, forms, badges, modals, and public screens.
- **Technical & Monospace Font**: `JetBrains Mono`, `ui-monospace`, monospace. Reserved strictly for technical identifiers, ticket serial numbers, transaction IDs, token hashes, codes, and slugs.
- **Forbidden Patterns**:
  - No condensed font variants or artificial negative letter-spacing for UI copy.
  - Weights below 400 are forbidden (no 300 or ultra-light weights).
  - 11–12px is prohibited as the default for ordinary table data, form labels, or body text. Minimum micro size is 12px for compact technical metadata.

#### Semantic Type Scale

| Semantic Token | Desktop Size | Mobile Size | Line Height | Weight | Letter Spacing | Intended Application |
|---|---|---|---|---|---|---|
| **Display / Page Hero** | 32–36px (`2rem–2.25rem`) | 28–30px | 1.15–1.20 | 700 (Bold) | -0.025em | Major standalone public event headings, hero titles |
| **Page Title** | 28–32px (`1.75rem–2rem`) | 24–26px | 1.20–1.25 | 700 (Bold) | -0.02em | Primary workspace titles: Overview, Events, Form Builder, Audit Trail |
| **Section Heading** | 20–24px (`1.25rem–1.5rem`) | 18–20px | 1.25–1.35 | 600–700 | -0.015em | Major page sections, prominent card group headings |
| **Card Heading** | 16–18px (`1rem–1.125rem`) | 16px | 1.30–1.40 | 600 (Semibold) | Normal | Card titles, panel headings, modal titles, table section titles |
| **Body Large** | 16px (`1rem`) | 15px | 1.50–1.60 | 400–500 | Normal | Prominent event descriptions, lead paragraphs, important alerts |
| **Body Default** | 14–15px (`0.875rem–0.9375rem`) | 14px | 1.45–1.55 | 400–500 | Normal | Standard interface text, navigation, table values, general descriptions |
| **Label** | 14px (`0.875rem`) | 14px | 1.35–1.45 | 500–600 | Normal | Input labels, table column headers, form control descriptions |
| **Small / Helper** | 13px (`0.8125rem`) | 13px | 1.45–1.50 | 400–500 | Normal | Secondary information, helper text, timestamps, supporting metadata |
| **Micro / Technical** | 12px (`0.75rem`) min | 12px | 1.35–1.40 | 500–600 | +0.02em | Compact technical metadata, status badges, serial IDs (mono) |

#### Font Weight Distribution

- **400 (Regular)**: Body copy, long descriptions, standard table values, helper text.
- **500 (Medium)**: Unselected navigation items, input values, buttons, tabs, secondary labels, filter dropdowns.
- **600 (Semibold)**: Card titles, section headings, table headers, active navigation, input labels, prominent badges.
- **700 (Bold)**: Page titles, key metric numbers, entrance pass attendee name, major emphasis.

#### Semantic CSS Utility Classes (`src/app/globals.css`)

- `.page-title`: `text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight`
- `.section-heading`: `text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 leading-snug`
- `.card-heading`: `text-base sm:text-lg font-semibold text-zinc-900 leading-snug`
- `.body-large`: `text-base font-normal text-zinc-700 leading-relaxed`
- `.body-default`: `text-[15px] font-normal text-zinc-700 leading-normal`
- `.field-label`: `text-sm font-medium text-zinc-800 leading-snug`
- `.helper-text`: `text-[13px] font-normal text-zinc-500 leading-normal`
- `.caption-text`: `text-xs font-medium text-zinc-500 leading-normal`
- `.technical-mono`: `font-mono text-xs font-medium tracking-normal text-zinc-700`

---

### 2.3 Spacing & Layout Tokens

- **Sidebar Width**: `256px` (`w-64`) on desktop; collapsible overlay on mobile (`< 1024px`).
- **Top Header Height**: `60px` (`h-15`).
- **Grid Gutters**: `16px` (`gap-4`) to `24px` (`gap-6`).
- **Border Radii**:
  - Small / Micro (`rounded-md`): `6px` for tags, badges, buttons.
  - Medium (`rounded-xl`): `12px` for metric cards, input fields, tables.
  - Large (`rounded-2xl`): `16px` for major modal dialogues, boarding pass cards.
- **Shadows**:
  - `shadow-2xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.03)`
  - `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)`

---

## 3. Component Specifications

### 3.1 Application Shell & Navigation
1. **Sidebar Navigation**:
   - Pinned organization badge with switcher trigger.
   - Grouped link sections: Overview (`Dashboard`), Operations (`Events`, `Registrations`, `Tickets`), Gate Control (`Verification Scanner`), Administration (`Settings`).
   - Active indicator: solid dark pill (`bg-zinc-900 text-white`) with high-contrast icon.
   - Pinned user profile footer with avatar, name, role, and sign-out trigger.
2. **Top Header**:
   - Page title and dynamic breadcrumbs.
   - Global search input with keyboard shortcut tooltip (`⌘K`).
   - Real-time synchronization indicator (`● Live Sync`).
   - Quick Action button (`+ Create Event`).
   - Responsive hamburger button on mobile screens.

### 3.2 Metric Cards (4-Column Operational Grid)
- Each card contains:
  1. Icon container in a rounded square (`w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center`).
  2. Muted uppercase label (`text-[11px] font-mono text-zinc-500 uppercase tracking-wider`).
  3. Bold stat counter (`text-2xl font-bold tracking-tight text-zinc-900`).
  4. Contextual delta pill badge (`+X%` or `0 pending items`).

### 3.3 High-Density Data Tables
- Integrated search bar and category filter pills (`All`, `Published`, `Live`, `Draft`).
- Column headers with sort arrows (`Date`, `Event Name`, `Status`, `Capacity`).
- Status pills with colored bullet dots (`● Live`, `● Published`, `● Draft`, `● Ended`).
- Interactive row actions (`Manage`, `View Public Page`, `Form Builder`).

### 3.4 Verification & Scanner Interface (State-Aware Gating)
- **State-Aware Routing**:
  - **Single Live Event**: Automatically opens the dedicated scanner for that active event.
  - **Multiple Live Events**: Presents an entrance gate selector requiring the operator to select the active turnstile.
  - **No Live Events / Before Start**: Displays clear status card explaining that verification is inactive until the event is marked `LIVE`.
  - **Ended / Cancelled Events**: Displays verification closed feedback card.
- **Cross-Event Guarding (`WRONG_EVENT`)**: Prevents admitting passes issued for other events at the selected gate.
- **Atomic Concurrency**: Single-use atomic update (`status = 'CHECKED_IN' WHERE status = 'ISSUED'`) prevents double-admittance race conditions.
- **Turnstile Mobile Feedback Cards**:
  - **VALID PASS**: Emerald green card, check icon, attendee name, pass number, event name.
  - **ALREADY CHECKED IN**: Amber card with prior check-in timestamp.
  - **WRONG EVENT PASS**: Amber/red card indicating pass was issued for a different gathering.
  - **INVALID PASS**: Red card with warning message.
  - **REVOKED PASS**: Red card indicating cancelled registration.
- Fallback manual token code input with laser barcode autofocus.

---

## 4. Accessibility & Interaction Standards

1. **Focus States**: High-contrast outline ring (`focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2`).
2. **Contrast Ratio**: All body copy satisfies WCAG AA (minimum 4.5:1 ratio against surface background).
3. **No Decorative Placeholders**: All buttons and triggers wire directly into real server actions, API routes, or navigational paths.
