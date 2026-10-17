"use client";

import { ArrowRight, ArrowDownRight, CheckCircle2, QrCode } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function HeroSection() {
  const { openDemoModal } = useDemoModal();

  return (
    <section className="relative pt-8 pb-20 sm:pt-16 sm:pb-28 overflow-hidden border-b border-zinc-200/70">
      {/* Subtle architectural grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Bold Editorial Positioning */}
          <div className="lg:col-span-7 flex flex-col justify-center pt-2">
            
            {/* Minimal Editorial Category Stamp */}
            <div className="inline-flex items-center gap-2.5 mb-6 text-xs font-mono tracking-wider text-zinc-600 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Event Operations Platform</span>
              <span className="text-zinc-300">/</span>
              <span className="text-zinc-500">Built for Organizers</span>
            </div>

            {/* Confident Headline with deliberate line break */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-[-0.035em] text-zinc-900 leading-[1.04]">
              Your event.
              <br />
              <span className="font-editorial italic font-normal text-zinc-800">
                Less chaos.
              </span>
            </h1>

            {/* Clear, plain-language supporting copy */}
            <p className="mt-6 text-base sm:text-lg text-zinc-600 max-w-xl font-normal leading-relaxed">
              Create your event, manage registrations, and get tickets into attendees’ hands. Keep everything organized from sign-up to the door.
            </p>

            {/* Direct Action CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={openDemoModal}
                className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <span>Get demo</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </button>
              
              <a
                href="#product-preview"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-white border border-zinc-200 text-zinc-800 text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <span>Explore the platform</span>
                <ArrowDownRight className="h-4 w-4 text-zinc-400" />
              </a>
            </div>

            {/* Editorial Product Assurances (Genuine capabilities) */}
            <div className="mt-12 pt-8 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-xl text-xs text-zinc-600">
              <div className="space-y-1">
                <span className="font-mono text-zinc-900 font-semibold uppercase text-[11px] block">
                  Zero Friction
                </span>
                <p className="text-zinc-500 leading-normal">
                  Attendees get passes straight in email. No app downloads or account creation.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-zinc-900 font-semibold uppercase text-[11px] block">
                  Direct Approvals
                </span>
                <p className="text-zinc-500 leading-normal">
                  Collect payments via bKash, Nagad, or bank with zero platform deductions.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-zinc-900 font-semibold uppercase text-[11px] block">
                  Staff Turnstiles
                </span>
                <p className="text-zinc-500 leading-normal">
                  1-click volunteer scanner links without exposing your database or financials.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: High-Density, Authentic Product Command Slice */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-900 tracking-tight">
                    Event Workspace
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">/</span>
                  <span className="text-[11px] font-mono text-zinc-500">dev-summit-26</span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LIVE
                </span>
              </div>

              {/* Event Title & Schedule */}
              <div className="pt-4 pb-3">
                <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                  Design Systems & Architecture Colloquium
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Auditorium 4 • Main Campus • Starts 10:00 AM
                </p>
              </div>

              {/* Operational Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-100 bg-[#fbfbf9]/60 -mx-5 sm:-mx-6 px-5 sm:px-6">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Capacity
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold font-mono text-zinc-900">284</span>
                    <span className="text-xs text-zinc-400 font-mono">/ 300</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-[94.6%]" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Admitted at Door
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold font-mono text-emerald-700">216</span>
                    <span className="text-xs text-zinc-500">scanned</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Gate 1 & Gate 2 active
                  </span>
                </div>
              </div>

              {/* Real-Time Operational Stream */}
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  <span>Recent Event Activity</span>
                  <span className="text-emerald-600 font-medium lowercase">● live sync</span>
                </div>

                {/* Activity Item 1: Valid check-in */}
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Aisha Rahman</p>
                      <p className="text-[10px] font-mono text-zinc-400">Pass #TK-84012 • General</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-700 font-medium block">
                      Admitted
                    </span>
                    <span className="text-[10px] text-zinc-400">0.3s ago</span>
                  </div>
                </div>

                {/* Activity Item 2: Pending manual payment approval */}
                <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      ৳
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Tanvir Hassan</p>
                      <p className="text-[10px] font-mono text-zinc-500">bKash TrxID: 9X82LA71</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60">
                    Review Payment
                  </span>
                </div>

                {/* Activity Item 3: Volunteer scanner active */}
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0">
                      <QrCode className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Volunteer Gate 1</p>
                      <p className="text-[10px] text-zinc-500">Turnstile Staff Scanner</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    24 passes / min
                  </span>
                </div>

              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono">Central Database Sync</span>
                <span className="font-mono text-zinc-600">Zero Race Conditions</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
