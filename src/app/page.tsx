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
  Sparkles,
  Server,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const steps = [
    {
      title: "Organization",
      desc: "Isolated multi-tenant accounts with strict role boundaries.",
      icon: Building2,
      tag: "Phase 2",
    },
    {
      title: "Event",
      desc: "Explicit state transitions: DRAFT → PUBLISHED → LIVE → ENDED.",
      icon: CalendarCheck2,
      tag: "Phase 3",
    },
    {
      title: "Registration",
      desc: "Configurable dynamic forms with accountless attendee registration.",
      icon: Sparkles,
      tag: "Phase 4-5",
    },
    {
      title: "Ticket",
      desc: "Unified issuance pipeline with 256-bit entropy SHA-256 tokens.",
      icon: Ticket,
      tag: "Phase 6-8",
    },
    {
      title: "QR Verification",
      desc: "Temporary event-scoped verifier access via magic links.",
      icon: QrCode,
      tag: "Phase 10",
    },
    {
      title: "Atomic Check-in",
      desc: "Concurrency-safe database transactions guaranteeing at most 1 check-in.",
      icon: ShieldCheck,
      tag: "Phase 11-12",
    },
  ];

  const pillars = [
    {
      icon: Lock,
      title: "Backend Source of Truth",
      description:
        "Never trusts client timestamps, hidden form inputs, QR payloads, or client-side permissions. Every mutation is verified server-side.",
    },
    {
      icon: Zap,
      title: "Atomic Concurrency Safety",
      description:
        "Guarantees that multiple simultaneous scans of the same QR code will only succeed once via database-level transactions and constraints.",
    },
    {
      icon: Server,
      title: "Lean & Maintainable Architecture",
      description:
        "Monolithic Next.js App Router with Supabase PostgreSQL and Resend transactional email. No unnecessary microservices.",
    },
    {
      icon: Cpu,
      title: "Scoped Verifier Isolation",
      description:
        "Verifiers receive temporary, event-bounded credentials that cannot inspect attendee profiles or access other events.",
    },
  ];

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-[500px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full" />

      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">TicketPlatform</span>
              <span className="ml-2 text-xs text-zinc-400 font-mono hidden sm:inline-block">
                v0.1.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Phase 1 Foundation Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-20 relative z-10 flex-1">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            Zero Attendee Accounts • Concurrency-Safe Check-in
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Secure, Lean Event Ticket Generation &{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              Verification Platform
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            A production-quality platform for organizations to create events, configure registration
            forms, issue cryptographically signed digital tickets, and verify entrance with
            mobile-first atomic check-in.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/docs/ARCHITECTURE.md" target="_blank">
              <Button size="lg" className="gap-2">
                View Architecture Docs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/docs/DATABASE.md" target="_blank">
              <Button variant="secondary" size="lg">
                Inspect Database Schema
              </Button>
            </Link>
          </div>
        </div>

        {/* Mental Model Pipeline */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Core Architectural Pipeline
              </h2>
              <p className="text-xs text-zinc-400">
                Strict unidirectional business flow from organization to check-in.
              </p>
            </div>
            <Badge variant="info">Monolithic Flow</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.title}
                  className="hover:border-zinc-700 transition-all duration-200 group relative overflow-hidden"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-400 text-zinc-300 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Step 0{idx + 1} • {step.tag}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {step.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Security & Architectural Pillars */}
        <section className="space-y-6">
          <div className="border-b border-zinc-800/80 pb-3">
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Security & Operational Guarantees
            </h2>
            <p className="text-xs text-zinc-400">
              Enforced by backend design, database constraints, and cryptographic hashing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 flex gap-4 items-start"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-1 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white">{pillar.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TicketPlatform. Clean, Secure, and Production-Ready.</p>
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span>Next.js 16</span>
            <span>•</span>
            <span>TypeScript 5</span>
            <span>•</span>
            <span>Tailwind v4</span>
            <span>•</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
