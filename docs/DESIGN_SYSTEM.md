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

### 2.2 Typography Scale

- **UI Font Family**: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif.
- **Editorial Accent Font**: `Newsreader`, `Georgia`, serif (for public mastheads, hero titles, boarding pass titles).
- **Code & Token Font**: `JetBrains Mono`, monospace (for ticket numbers, hashes, slug URLs, timestamps).

| Scale | Size | Line Height | Weight | Typical Application |
|---|---|---|---|---|
| **Display** | 36px–48px | 1.1 | 700 | Public hero headers, public event invitations |
| **H1** | 24px (1.5rem) | 1.25 | 700 | Dashboard page titles, major view headers |
| **H2** | 18px (1.125rem) | 1.35 | 600 | Card titles, section headers |
| **H3 / Body Bold** | 14px (0.875rem) | 1.4 | 600 | Metric card headers, table row titles, button labels |
| **Body Regular** | 14px (0.875rem) | 1.5 | 400 | Form fields, descriptive paragraphs |
| **Caption / Small** | 12px (0.75rem) | 1.4 | 500 | Badges, table headers, breadcrumbs, helper texts |
| **Micro / Mono** | 10px–11px | 1.3 | 500/600 | Ticket serial numbers, uppercase status pills |

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

### 3.4 Verification & Scanner Interface
- High-contrast, single-purpose mobile interface.
- Viewport for camera QR scanner with guide reticle.
- Instant full-screen status flash:
  - **VALID PASS**: Emerald green banner, check icon, attendee details, seat/tier, timestamp.
  - **ALREADY CHECKED IN**: Amber banner with prior check-in timestamp.
  - **INVALID PASS**: Red banner with warning message.
  - **REVOKED PASS**: Red banner indicating cancelled registration.
- Fallback manual token code input.

---

## 4. Accessibility & Interaction Standards

1. **Focus States**: High-contrast outline ring (`focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2`).
2. **Contrast Ratio**: All body copy satisfies WCAG AA (minimum 4.5:1 ratio against surface background).
3. **No Decorative Placeholders**: All buttons and triggers wire directly into real server actions, API routes, or navigational paths.
