import Link from "next/link";
import {
  ShieldCheck,
  QrCode,
  CalendarCheck2,
  Ticket,
  Lock,
  Building2,
  Cpu,
  ArrowRight,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const folios = [
    {
      num: "I",
      title: "Zero Attendee Friction",
      subtitle: "Accountless Admission Pipeline",
      body: "Attendees never register accounts, establish passwords, or submit to surveillance tracking. Registrations issue cryptographically unguessable 256-bit entropy SHA-256 tokens directly via signed digital passes.",
      badge: "Cryptographic Integrity",
    },
    {
      num: "II",
      title: "The Atomic Gate",
      subtitle: "Concurrency-Safe Verification",
      body: "High-volume turnstiles demand zero double-scans. Database-level row locking executes entrance verification atomically in single-digit milliseconds, eliminating race conditions across parallel physical gates.",
      badge: "PostgreSQL Row Lock",
    },
    {
      num: "III",
      title: "Sovereign Multi-Tenancy",
      subtitle: "Isolated Organization Workspaces",
      body: "Organizations operate in completely secluded tenants. Custom dynamic registration forms, flexible capacity thresholds, and temporary scoped magic links grant gatekeepers check-in permissions without account overhead.",
      badge: "Tenant Isolation",
    },
  ];

  const specifications = [
    { label: "Lifecycle State Machine", value: "DRAFT → PUBLISHED → LIVE → ENDED (Strict State Guards)" },
    { label: "Token Cryptography", value: "32-byte CSPRNG hex string, SHA-256 hashed at rest" },
    { label: "Verification Security", value: "Atomic transaction with FOR UPDATE row-level locking" },
    { label: "Attendee Authentication", value: "Token-bound bearer URLs; Zero attendee passwords required" },
    { label: "Verifier Delegation", value: "Event-scoped ephemeral credentials with magic links" },
    { label: "Delivery Pipeline", value: "RFC-compliant transactional email via Resend API" },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-zinc-50">
      {/* Top Editorial Masthead Rule */}
      <div className="border-b border-zinc-900/10 bg-white/70 backdrop-blur-xs text-[11px] font-mono tracking-widest uppercase text-zinc-500 py-1.5 px-4 sm:px-8 flex items-center justify-between">
        <span>The Ticket Platform Gazette</span>
        <span className="hidden sm:inline">Autonomous Event Infrastructure • Vol. MMXXVI</span>
        <span>Issue N° 01</span>
      </div>

      {/* Main Header / Navigation */}
      <header className="border-b-2 border-zinc-900 px-4 sm:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 hover:opacity-80 transition-opacity">
              TicketPlatform
            </Link>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 hidden md:inline">
              [System of Record]
            </span>
          </div>

          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Organizer Sign In
            </Link>
            <Link href="/org">
              <Button size="sm" className="text-xs font-semibold px-4 tracking-wide">
                Dashboard
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* Editorial Front Page Header & Lede */}
        <section className="space-y-6 pb-12 border-b border-zinc-900/15">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-900 inline-block" />
            <span>Foundational Protocol • Release 1.0</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.08] max-w-5xl">
            The Architecture of Gathering.
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <p className="lg:col-span-8 font-editorial italic text-xl sm:text-2xl text-zinc-700 leading-relaxed">
              &ldquo;Software for human assembly ought to be silent, uncompromising, and mathematically sound. No promotional spam, no attendee tracking, no gate delays.&rdquo;
            </p>

            <div className="lg:col-span-4 flex flex-col justify-end space-y-3">
              <p className="text-xs text-zinc-500 leading-relaxed">
                An unapologetically lean ticketing engine engineered for organizers who prioritize reliability over marketing clutter.
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Link href="/org">
                  <Button className="h-10 px-5 text-xs uppercase tracking-wider font-semibold">
                    Enter Workspace
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="h-10 px-5 text-xs uppercase tracking-wider font-semibold">
                    Register Org
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Broadsheet Folios */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-zinc-900/15 pb-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Folios of Operation — Core Tenets
            </h2>
            <span className="text-xs font-mono text-zinc-400">§ 01–03</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {folios.map((folio) => (
              <article
                key={folio.num}
                className="flex flex-col justify-between p-6 bg-white border border-zinc-200/90 rounded-none shadow-xs hover:border-zinc-400 transition-colors relative"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-editorial text-2xl font-bold text-zinc-300">
                      {folio.num}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-xs border border-zinc-200">
                      {folio.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-zinc-900 leading-tight">
                      {folio.title}
                    </h3>
                    <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                      {folio.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-600 leading-relaxed font-sans pt-1">
                    {folio.body}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-100 text-xs font-medium text-zinc-900 flex items-center gap-1">
                  <span>Audited System Flow</span>
                  <Check className="h-3.5 w-3.5 text-zinc-500" />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Technical Ledger Specification Table */}
        <section className="space-y-4 pt-4">
          <div className="flex items-baseline justify-between border-b border-zinc-900/15 pb-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Technical Specification Ledger
            </h2>
            <span className="text-xs font-mono text-zinc-400">RFC Compliant</span>
          </div>

          <div className="border border-zinc-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 font-mono uppercase text-zinc-500 text-[11px]">
                  <th className="p-3.5 font-medium sm:w-1/3">Component Parameter</th>
                  <th className="p-3.5 font-medium">Guaranteed Architecture Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-sans">
                {specifications.map((spec) => (
                  <tr key={spec.label} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-3.5 font-medium text-zinc-900 font-mono">{spec.label}</td>
                    <td className="p-3.5 text-zinc-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Minimal Bottom Editorial Banner */}
        <section className="p-8 sm:p-12 border-2 border-zinc-900 bg-white space-y-6 text-center max-w-4xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            For Gatherings of Any Magnitude
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
            Ready to issue your first verified pass?
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Create an organization workspace in seconds. Design your registration schema, publish an event, and receive attendees seamlessly.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" className="px-6 text-xs uppercase tracking-widest font-semibold">
                Get Started Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-6 text-xs uppercase tracking-widest font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Colophon Footer */}
      <footer className="border-t border-zinc-900/10 bg-white mt-16 py-10 px-4 sm:px-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 font-mono text-[11px]">
          <div>
            <span className="font-semibold text-zinc-900">TicketPlatform</span> — Typeset in Newsreader & Plus Jakarta Sans.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Organizer Login
            </Link>
            <Link href="/signup" className="hover:text-zinc-900 transition-colors">
              Register Organization
            </Link>
            <Link href="/org" className="hover:text-zinc-900 transition-colors">
              Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
