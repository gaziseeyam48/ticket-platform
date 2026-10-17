"use client";

import { ArrowRight, ArrowDownRight, CheckCircle2, QrCode } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function HeroSection() {
  const { openDemoModal } = useDemoModal();

  return (
    <section className="relative pt-8 pb-20 sm:pt-16 sm:pb-28 overflow-hidden border-b border-[#DDE5E2] bg-white">
      {/* Subtle architectural grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.5]"
        style={{
          backgroundImage: `linear-gradient(to right, #EDF4F2 1px, transparent 1px), linear-gradient(to bottom, #EDF4F2 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Bold Editorial Positioning */}
          <div className="lg:col-span-7 flex flex-col justify-center pt-2">
            
            {/* Minimal Editorial Category Stamp */}
            <div className="inline-flex items-center gap-2.5 mb-6 text-xs font-mono tracking-wider text-[#52615D] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#006B5B] animate-pulse" />
              <span>Event Operations Platform</span>
              <span className="text-[#DDE5E2]">/</span>
              <span className="text-[#66736F]">Built for Organizers</span>
            </div>

            {/* Confident Headline with deliberate line break */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-[-0.035em] text-[#17211F] leading-[1.04]">
              Your event.
              <br />
              <span className="font-editorial italic font-normal text-[#17211F]">
                Less chaos.
              </span>
            </h1>

            {/* Clear, plain-language supporting copy */}
            <p className="mt-6 text-base sm:text-lg text-[#52615D] max-w-xl font-normal leading-relaxed">
              Create your event, manage registrations, and get tickets into attendees’ hands. Keep everything organized from sign-up to the door.
            </p>

            {/* Direct Action CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => openDemoModal("hero")}
                data-umami-event="Get Demo Click"
                data-umami-event-source="hero"
                className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-md bg-[#006B5B] text-white text-sm font-medium hover:bg-[#00564A] transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <span>Get demo</span>
                <ArrowRight className="h-4 w-4 text-white/80" />
              </button>
              
              <a
                href="#product-preview"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-white border border-[#DDE5E2] text-[#17211F] text-sm font-medium hover:bg-[#F5F7F8] hover:border-[#006B5B] hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
              >
                <span>Explore the platform</span>
                <ArrowDownRight className="h-4 w-4 text-[#52615D]" />
              </a>
            </div>

            {/* Editorial Product Assurances (Genuine capabilities) */}
            <div className="mt-12 pt-8 border-t border-[#DDE5E2] grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-xl text-xs text-[#52615D]">
              <div className="space-y-1">
                <span className="font-mono text-[#17211F] font-semibold uppercase text-[11px] block">
                  Zero Friction
                </span>
                <p className="text-[#66736F] leading-normal">
                  Attendees get passes straight in email. No app downloads or account creation.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[#17211F] font-semibold uppercase text-[11px] block">
                  Direct Approvals
                </span>
                <p className="text-[#66736F] leading-normal">
                  Collect payments via bKash, Nagad, or bank with zero platform deductions.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[#17211F] font-semibold uppercase text-[11px] block">
                  Staff Turnstiles
                </span>
                <p className="text-[#66736F] leading-normal">
                  1-click volunteer scanner links without exposing your database or financials.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: High-Density, Authentic Product Command Slice */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-xl border border-[#DDE5E2] bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,107,91,0.06)]">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DDE5E2]/70">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#006B5B]" />
                  <span className="text-xs font-semibold text-[#17211F] tracking-tight">
                    Event Workspace
                  </span>
                  <span className="text-[11px] font-mono text-[#66736F]">/</span>
                  <span className="text-[11px] font-mono text-[#52615D]">dev-summit-26</span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20">
                  LIVE
                </span>
              </div>

              {/* Event Title & Schedule */}
              <div className="pt-4 pb-3">
                <h3 className="text-base font-bold text-[#17211F] tracking-tight">
                  Design Systems & Architecture Colloquium
                </h3>
                <p className="text-xs text-[#66736F] mt-0.5">
                  Auditorium 4 • Main Campus • Starts 10:00 AM
                </p>
              </div>

              {/* Operational Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#DDE5E2]/80 bg-[#F5F7F8] -mx-5 sm:-mx-6 px-5 sm:px-6">
                <div>
                  <span className="text-[10px] font-mono text-[#66736F] uppercase tracking-wider block">
                    Capacity
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold font-mono text-[#17211F]">284</span>
                    <span className="text-xs text-[#66736F] font-mono">/ 300</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-[#DDE5E2] rounded-full overflow-hidden">
                    <div className="h-full bg-[#006B5B] rounded-full w-[94.6%]" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#66736F] uppercase tracking-wider block">
                    Admitted at Door
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold font-mono text-[#006B5B]">216</span>
                    <span className="text-xs text-[#52615D]">scanned</span>
                  </div>
                  <span className="text-[10px] text-[#66736F] mt-1 block">
                    Gate 1 & Gate 2 active
                  </span>
                </div>
              </div>

              {/* Real-Time Operational Stream */}
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#66736F] uppercase tracking-wider">
                  <span>Recent Event Activity</span>
                  <span className="text-[#006B5B] font-medium lowercase">● live sync</span>
                </div>

                {/* Activity Item 1: Valid check-in */}
                <div className="p-2.5 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2]/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-[#EDF4F2] text-[#006B5B] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#17211F]">Aisha Rahman</p>
                      <p className="text-[10px] font-mono text-[#66736F]">Pass #TK-84012 • General</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#006B5B] font-medium block">
                      Admitted
                    </span>
                    <span className="text-[10px] text-[#66736F]">0.3s ago</span>
                  </div>
                </div>

                {/* Activity Item 2: Pending manual payment approval (Amber highlight) */}
                <div className="p-2.5 rounded-lg bg-[#FFF8E7] border border-[#FFBE2E]/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-[#FFBE2E] text-[#17211F] flex items-center justify-center shrink-0 text-[10px] font-bold">
                      ৳
                    </div>
                    <div>
                      <p className="font-medium text-[#17211F]">Tanvir Hassan</p>
                      <p className="text-[10px] font-mono text-[#52615D]">bKash TrxID: 9X82LA71</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#17211F] bg-[#FFBE2E] hover:bg-[#EAA81D] px-2 py-0.5 rounded border border-[#EAA81D] transition-colors">
                    Review Payment
                  </span>
                </div>

                {/* Activity Item 3: Volunteer scanner active */}
                <div className="p-2.5 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2]/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded bg-[#EDF4F2] text-[#52615D] flex items-center justify-center shrink-0">
                      <QrCode className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#17211F]">Volunteer Gate 1</p>
                      <p className="text-[10px] text-[#66736F]">Turnstile Staff Scanner</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#52615D]">
                    24 passes / min
                  </span>
                </div>

              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#DDE5E2]/70 flex items-center justify-between text-[11px] text-[#66736F]">
                <span className="font-mono">Central Database Sync</span>
                <span className="font-mono text-[#17211F]">Zero Race Conditions</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
