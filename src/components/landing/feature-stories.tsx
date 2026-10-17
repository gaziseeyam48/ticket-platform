"use client";

import { useState } from "react";
import {
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { playScanSound, triggerHaptic } from "@/lib/utils/audio";

export function FeatureStories() {
  const [activeSoundDemo, setActiveSoundDemo] = useState<"valid" | "duplicate" | null>(null);

  const handleTriggerSound = (type: "VALID" | "ALREADY_CHECKED_IN") => {
    setActiveSoundDemo(type === "VALID" ? "valid" : "duplicate");
    playScanSound(type);
    triggerHaptic(type);
  };

  return (
    <section id="capabilities" className="py-20 sm:py-32 bg-[#F5F7F8] border-b border-[#DDE5E2]">
      <div className="max-w-7xl mx-auto px-6 space-y-24 sm:space-y-36">
        
        {/* Section Intro */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[#52615D] uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B]" />
            <span>Product Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17211F] leading-tight">
            Built for how events actually run.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#52615D] leading-relaxed max-w-2xl">
            Four purpose-built workflows designed to address real logistical challenges organizers face every week.
          </p>
        </div>

        {/* ================================================================= */}
        {/* STORY 1: Custom Registration Forms (Text Left, Schema Right)     */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#52615D] uppercase">
              <span className="font-bold text-[#006B5B] font-mono">01</span>
              <span className="text-[#DDE5E2]">/</span>
              <span>Intake Flexibility</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#17211F] leading-tight">
              Forms built for the exact questions you need answered.
            </h3>

            <p className="text-base text-[#52615D] leading-relaxed">
              When organizing an academic symposium, club competition, or community workshop, you need more than just a name and an email.
            </p>

            <p className="text-sm text-[#52615D] leading-relaxed">
              TicketKoi includes a visual form schema builder where you configure custom fields for student roll numbers, dietary selections, workshop tracks, and consent checkboxes. No third-party forms, no CSV stitching.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-[#52615D]">
              <span className="px-2.5 py-1 rounded bg-white border border-[#DDE5E2]">Text &amp; Textarea</span>
              <span className="px-2.5 py-1 rounded bg-white border border-[#DDE5E2]">Single &amp; Multi Dropdown</span>
              <span className="px-2.5 py-1 rounded bg-white border border-[#DDE5E2]">Radio Choices</span>
              <span className="px-2.5 py-1 rounded bg-white border border-[#DDE5E2]">Required Toggles</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[#DDE5E2] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5E2]/60">
                <span className="text-xs font-mono font-medium text-[#52615D] uppercase">Form Schema Preview</span>
                <span className="text-[11px] font-mono text-[#006B5B] bg-[#EDF4F2] px-2 py-0.5 rounded border border-[#006B5B]/30 font-medium">
                  Live on Event Page
                </span>
              </div>

              {/* Realistic Form Preview */}
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-lg border border-[#DDE5E2] bg-[#F5F7F8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#17211F]">1. University ID / Roll Number</span>
                    <span className="text-[10px] font-mono text-[#F04A24] bg-[#FDEEEA] px-1.5 py-0.5 rounded border border-[#F04A24]/30 font-semibold">
                      Required
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 2024-CSE-092"
                    className="w-full h-8 px-2.5 rounded border border-[#DDE5E2] bg-white text-[#17211F] text-xs placeholder:text-[#66736F]"
                    readOnly
                  />
                </div>

                <div className="p-3 rounded-lg border border-[#DDE5E2] bg-[#F5F7F8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#17211F]">2. Selected Workshop Session</span>
                    <span className="text-[10px] font-mono text-[#F04A24] bg-[#FDEEEA] px-1.5 py-0.5 rounded border border-[#F04A24]/30 font-semibold">
                      Required
                    </span>
                  </div>
                  <select className="w-full h-8 px-2.5 rounded border border-[#DDE5E2] bg-white text-[#17211F] text-xs" disabled defaultValue="Session A: Real-Time Systems Architecture">
                    <option value="Session A: Real-Time Systems Architecture">Session A: Real-Time Systems Architecture</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg border border-[#DDE5E2] bg-[#F5F7F8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#17211F]">3. Dietary Preferences</span>
                    <span className="text-[10px] font-mono text-[#52615D] bg-[#F5F7F8] px-1.5 py-0.5 rounded border border-[#DDE5E2]">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Vegetarian / Halal / Nut Allergy"
                    className="w-full h-8 px-2.5 rounded border border-[#DDE5E2] bg-white text-[#17211F] text-xs placeholder:text-[#66736F]"
                    readOnly
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#66736F]">
                <span>Schema JSON Validated</span>
                <span>Sanitized on submission</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* STORY 2: Manual Payment Review (Table Left, Text Right)          */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-xl border border-[#DDE5E2] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5E2]/60">
                <span className="text-xs font-mono font-medium text-[#52615D] uppercase">Payment Verification Queue</span>
                <span className="text-xs font-mono text-[#17211F] bg-[#FFF8E7] px-2 py-0.5 rounded border border-[#FFBE2E] font-medium">
                  Manual Review
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#FFBE2E]/70 bg-[#FFF8E7]/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#17211F]">Nayeem Ahmed</span>
                    <span className="font-mono font-bold text-[#17211F]">৳ 500 BDT</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-[#52615D]">
                    <p>Method: <span className="font-semibold text-[#17211F]">bKash Personal</span></p>
                    <p className="font-mono">Sender: 01712-882910 • TrxID: 9M40LA921</p>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-[#006B5B] text-white font-medium hover:bg-[#00564A] text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      Approve &amp; Issue Pass
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded border border-[#DDE5E2] bg-white text-[#52615D] text-xs hover:text-[#17211F] hover:bg-[#F5F7F8] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#DDE5E2] bg-[#F5F7F8] space-y-1 text-xs opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#17211F]">Zubair Karim</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/30 font-medium">
                      TICKET DELIVERED
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#66736F]">
                    Nagad TrxID: NG-3891024 • Approved by Admin • Pass #TK-90801
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-[#66736F] flex items-center justify-between">
                <span>Direct Accounts (No Gateway Cut)</span>
                <span>Zero Platform Fees</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#52615D] uppercase">
              <span className="font-bold text-[#006B5B] font-mono">02</span>
              <span className="text-[#DDE5E2]">/</span>
              <span>Direct Financial Control</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#17211F] leading-tight">
              Collect payments directly. Review on your own terms.
            </h3>

            <p className="text-base text-[#52615D] leading-relaxed">
              Traditional online ticketing platforms charge high aggregator commissions and hold your payouts for weeks.
            </p>

            <p className="text-sm text-[#52615D] leading-relaxed">
              For campus events, workshops, and community gatherings that collect fees via bKash, Nagad, Rocket, or direct bank transfer, attendees simply paste their transaction ID at registration. Organizers verify incoming payments in a dedicated queue and issue passes with one click.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[#52615D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B]" />
              <span>Free events always issue passes instantly with zero review delay.</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* STORY 3: Gate Operations & Sound Simulator (Text Left, Sim Right) */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#52615D] uppercase">
              <span className="font-bold text-[#006B5B] font-mono">03</span>
              <span className="text-[#DDE5E2]">/</span>
              <span>Entrance Turnstiles</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#17211F] leading-tight">
              Staff your door without sharing your master account.
            </h3>

            <p className="text-base text-[#52615D] leading-relaxed">
              Door volunteers should never have access to your attendee contact database, revenue reports, or account passwords.
            </p>

            <p className="text-sm text-[#52615D] leading-relaxed">
              Generate a 1-click staff scanner link. Volunteers open it on any phone browser to scan tickets with instant visual and audio verification. Atomic turnstile concurrency guarantees that screenshotted or duplicate passes are locked immediately.
            </p>

            {/* Interactive Audio Simulator Control */}
            <div className="pt-2 p-4 rounded-xl border border-[#DDE5E2] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#17211F] font-semibold uppercase flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-[#52615D]" />
                  Try Scanner Audio Cues
                </span>
                <span className="text-[10px] font-mono text-[#66736F]">Web Audio API</span>
              </div>
              <p className="text-xs text-[#66736F]">
                Click below to hear the exact synthesized chimes door staff hear in real-time:
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleTriggerSound("VALID")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeSoundDemo === "valid"
                      ? "bg-[#006B5B] text-white shadow-xs"
                      : "bg-[#EDF4F2] text-[#006B5B] hover:bg-[#006B5B]/10 border border-[#006B5B]/30"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Play &quot;Valid Pass&quot; Chime</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerSound("ALREADY_CHECKED_IN")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    activeSoundDemo === "duplicate"
                      ? "bg-[#FFBE2E] text-[#17211F] font-bold shadow-xs border border-[#EAA81D]"
                      : "bg-[#FFF8E7] text-[#17211F] hover:bg-[#FFBE2E]/20 border border-[#FFBE2E]"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Play &quot;Already Scanned&quot; Tone</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[#DDE5E2] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5E2]/60">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#52615D]" />
                  <span className="text-xs font-mono font-medium text-[#17211F]">Restricted Staff Scanner Portal</span>
                </div>
                <span className="text-[11px] font-mono text-[#66736F]">turnstile-gate-01</span>
              </div>

              {/* Staff Access Card */}
              <div className="p-4 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2] space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE5E2]/60">
                  <span className="font-semibold text-[#17211F]">Volunteer Operator #3</span>
                  <span className="font-mono text-[10px] text-[#006B5B] bg-[#EDF4F2] px-2 py-0.5 rounded border border-[#006B5B]/30 font-medium">
                    SCAN ONLY PRIVILEGE
                  </span>
                </div>

                <div className="space-y-1.5 text-[#52615D]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Event Name</span>
                    <span className="font-medium text-[#17211F]">Leadership Colloquium</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Private Database Access</span>
                    <span className="font-mono text-[#F04A24] font-semibold">BLOCKED</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Financial &amp; Revenue Metrics</span>
                    <span className="font-mono text-[#F04A24] font-semibold">BLOCKED</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Offline Cache Fallback</span>
                    <span className="font-mono text-[#006B5B] font-semibold">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#EDF4F2] border border-[#006B5B]/30 text-xs text-[#17211F] flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-[#006B5B]/15 text-[#006B5B] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-[11px] leading-normal text-[#17211F]">
                  Atomic SQL transaction (<code className="font-mono font-semibold text-[#006B5B]">CHECKED_IN WHERE status = &apos;ISSUED&apos;</code>) eliminates double-entry race conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* STORY 4: Real-time Audit Logs (Audit UI Left, Text Right)         */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-xl border border-[#DDE5E2] bg-white p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE5E2]/60">
                <span className="text-xs font-mono font-medium text-[#52615D] uppercase">Immutable Event Audit Trail</span>
                <span className="text-[11px] font-mono text-[#66736F]">Timestamped Logs</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#F5F7F8] border border-[#DDE5E2]/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[#17211F] font-medium">TICKET_CHECKED_IN</span>
                    <p className="text-[10px] text-[#66736F]">Pass #TK-90812 • Gate 1 by Volunteer_01</p>
                  </div>
                  <span className="text-[10px] text-[#66736F]">09:14:22 AM</span>
                </div>

                <div className="p-2.5 rounded bg-[#F5F7F8] border border-[#DDE5E2]/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[#17211F] font-medium">PAYMENT_APPROVED</span>
                    <p className="text-[10px] text-[#66736F]">TrxID: 9M40LA921 • Issued Pass #TK-90812</p>
                  </div>
                  <span className="text-[10px] text-[#66736F]">08:42:10 AM</span>
                </div>

                <div className="p-2.5 rounded bg-[#F5F7F8] border border-[#DDE5E2]/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[#17211F] font-medium">STATUS_TRANSITION</span>
                    <p className="text-[10px] text-[#66736F]">Event changed from PUBLISHED to LIVE</p>
                  </div>
                  <span className="text-[10px] text-[#66736F]">08:00:00 AM</span>
                </div>

                <div className="p-2.5 rounded bg-[#F5F7F8] border border-[#DDE5E2]/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[#17211F] font-medium">REGISTRATION_CREATED</span>
                    <p className="text-[10px] text-[#66736F]">Dr. Tariq Anam • Form Schema Validated</p>
                  </div>
                  <span className="text-[10px] text-[#66736F]">Yesterday</span>
                </div>
              </div>

              <div className="pt-1 text-[11px] font-mono text-[#66736F] flex items-center justify-between">
                <span>Cryptographically verified</span>
                <span>Traceable actions</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#52615D] uppercase">
              <span className="font-bold text-[#006B5B] font-mono">04</span>
              <span className="text-[#DDE5E2]">/</span>
              <span>Operational Clarity</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#17211F] leading-tight">
              A clear, indisputable record of every action.
            </h3>

            <p className="text-base text-[#52615D] leading-relaxed">
              When hundreds of people move through an event, questions arise: Did this attendee pay? When was their pass issued? Was it already scanned at Gate 1?
            </p>

            <p className="text-sm text-[#52615D] leading-relaxed">
              TicketKoi logs every operational change with an immutable timestamp. Maintain full transparency across your organizing team and eliminate admission disputes with permanent audit records.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs font-mono text-[#52615D]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B]" />
              <span>Full audit history visible in your event workspace.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
