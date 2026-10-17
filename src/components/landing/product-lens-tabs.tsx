"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileEdit,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type LensKey = "workspace" | "formBuilder" | "payments" | "scanner";

export function ProductLensTabs() {
  const [activeLens, setActiveLens] = useState<LensKey>("workspace");

  return (
    <section id="product-preview" className="py-20 sm:py-32 bg-[#F5F7F8] border-b border-[#DDE5E2]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[#52615D] uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B]" />
            <span>Product in Action</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17211F] leading-tight">
            Designed for the reality of event operations.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#52615D] leading-relaxed max-w-2xl">
            Inspect the four dedicated surfaces organizers use to plan, collect registrations, review transactions, and admit attendees.
          </p>
        </div>

        {/* Lens Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#DDE5E2] scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveLens("workspace")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] ${
              activeLens === "workspace"
                ? "bg-[#006B5B] text-white shadow-xs"
                : "bg-white text-[#52615D] hover:text-[#006B5B] hover:bg-[#EDF4F2] border border-[#DDE5E2]"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Event Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLens("formBuilder")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] ${
              activeLens === "formBuilder"
                ? "bg-[#006B5B] text-white shadow-xs"
                : "bg-white text-[#52615D] hover:text-[#006B5B] hover:bg-[#EDF4F2] border border-[#DDE5E2]"
            }`}
          >
            <FileEdit className="h-4 w-4" />
            <span>Form Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLens("payments")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] ${
              activeLens === "payments"
                ? "bg-[#006B5B] text-white shadow-xs"
                : "bg-white text-[#52615D] hover:text-[#006B5B] hover:bg-[#EDF4F2] border border-[#DDE5E2]"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payment Approvals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLens("scanner")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] ${
              activeLens === "scanner"
                ? "bg-[#006B5B] text-white shadow-xs"
                : "bg-white text-[#52615D] hover:text-[#006B5B] hover:bg-[#EDF4F2] border border-[#DDE5E2]"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Gate Scanner</span>
          </button>
        </div>

        {/* View Surface: Crisp, architectural, authentic */}
        <div className="rounded-xl border border-[#DDE5E2] bg-white overflow-hidden shadow-xs">
          
          {/* Top Window Meta Bar */}
          <div className="px-5 py-3.5 bg-[#EDF4F2]/50 border-b border-[#DDE5E2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#66736F]">ticketkoi://app/</span>
              <span className="font-mono text-[#17211F] font-medium">
                {activeLens === "workspace" && "org/events/colloquium-2026"}
                {activeLens === "formBuilder" && "org/events/colloquium-2026/form"}
                {activeLens === "payments" && "org/events/colloquium-2026#payments"}
                {activeLens === "scanner" && "verify?event_id=colloquium-2026"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#006B5B]" />
              <span className="font-mono text-[11px] text-[#52615D] uppercase">
                Synchronized
              </span>
            </div>
          </div>

          {/* Tab 1: Event Workspace & Capacity */}
          {activeLens === "workspace" && (
            <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE5E2]/60">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211F]">
                      Annual Technology & Policy Colloquium
                    </h3>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#66736F] mt-1">
                    Created by IEEE Student Branch • Registration closed • Turnstiles active
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#66736F] block">Status Transition</span>
                    <span className="text-xs font-semibold text-[#17211F]">DRAFT → PUBLISHED → LIVE</span>
                  </div>
                </div>
              </div>

              {/* 4-Stat Metric Line */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2]">
                  <span className="text-[11px] font-mono text-[#66736F] uppercase tracking-wider block">Total Registered</span>
                  <p className="text-2xl font-bold font-mono text-[#17211F] mt-1">300</p>
                  <span className="text-xs text-[#52615D] mt-0.5 block">100% of capacity filled</span>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2]">
                  <span className="text-[11px] font-mono text-[#66736F] uppercase tracking-wider block">Tickets Issued</span>
                  <p className="text-2xl font-bold font-mono text-[#17211F] mt-1">294</p>
                  <span className="text-xs text-[#006B5B] font-medium mt-0.5 block">Delivered via inbox</span>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2]">
                  <span className="text-[11px] font-mono text-[#66736F] uppercase tracking-wider block">Checked In</span>
                  <p className="text-2xl font-bold font-mono text-[#006B5B] mt-1">216</p>
                  <span className="text-xs text-[#52615D] mt-0.5 block">73.4% attendance rate</span>
                </div>
                <div className="p-4 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2]">
                  <span className="text-[11px] font-mono text-[#66736F] uppercase tracking-wider block">Active Turnstiles</span>
                  <p className="text-2xl font-bold font-mono text-[#17211F] mt-1">3</p>
                  <span className="text-xs text-[#52615D] mt-0.5 block">Gate 1, Gate 2, VIP Door</span>
                </div>
              </div>

              {/* High-Density Attendee Table Preview */}
              <div>
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono text-[#52615D]">
                    Live Attendee Registry
                  </span>
                  <span className="text-xs text-[#66736F] font-mono">Showing 4 of 300 records</span>
                </div>

                <div className="overflow-x-auto border border-[#DDE5E2] rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F7F8] border-b border-[#DDE5E2] text-[#52615D] font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Attendee</th>
                        <th className="py-2.5 px-4 font-medium">Ticket Pass</th>
                        <th className="py-2.5 px-4 font-medium">Category</th>
                        <th className="py-2.5 px-4 font-medium">Gate Status</th>
                        <th className="py-2.5 px-4 font-medium text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE5E2]/60">
                      <tr className="hover:bg-[#F5F7F8] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#17211F]">Dr. Tariq Anam</td>
                        <td className="py-3 px-4 font-mono text-[#52615D]">TK-90812-B1</td>
                        <td className="py-3 px-4 text-[#52615D]">Keynote Speaker</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/30">
                            <span className="h-1 w-1 rounded-full bg-[#006B5B]" />
                            Checked In (Gate 1)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#66736F] text-right">09:14:22 AM</td>
                      </tr>
                      <tr className="hover:bg-[#F5F7F8] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#17211F]">Sadia Chowdhury</td>
                        <td className="py-3 px-4 font-mono text-[#52615D]">TK-90813-B2</td>
                        <td className="py-3 px-4 text-[#52615D]">General Attendee</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/30">
                            <span className="h-1 w-1 rounded-full bg-[#006B5B]" />
                            Checked In (Gate 2)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#66736F] text-right">09:18:05 AM</td>
                      </tr>
                      <tr className="hover:bg-[#F5F7F8] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#17211F]">Kamrul Hasan</td>
                        <td className="py-3 px-4 font-mono text-[#52615D]">TK-90814-B3</td>
                        <td className="py-3 px-4 text-[#52615D]">Student Pass</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F5F7F8] text-[#52615D] border border-[#DDE5E2]">
                            Issued (Awaiting Gate)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#66736F] text-right">—</td>
                      </tr>
                      <tr className="hover:bg-[#F5F7F8] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#17211F]">Mehnaz Parveen</td>
                        <td className="py-3 px-4 font-mono text-[#52615D]">TK-90815-B4</td>
                        <td className="py-3 px-4 text-[#52615D]">General Attendee</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/30">
                            <span className="h-1 w-1 rounded-full bg-[#006B5B]" />
                            Checked In (Gate 1)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#66736F] text-right">09:21:40 AM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Form Builder */}
          {activeLens === "formBuilder" && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#DDE5E2]/60">
                <div>
                  <h3 className="text-lg font-bold text-[#17211F]">Registration Form Schema</h3>
                  <p className="text-xs text-[#66736F]">Configure questions attendees must answer during checkout.</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20 font-medium">
                  5 Custom Fields
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Form Fields List */}
                <div className="md:col-span-7 space-y-3">
                  <div className="p-3.5 rounded-lg border border-[#DDE5E2] bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#17211F]">Full Name</span>
                        <span className="text-[10px] font-mono text-[#F04A24] bg-[#FDEEEA] px-1.5 py-0.2 rounded border border-[#F04A24]/30 font-semibold">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-[#66736F] text-[11px]">Short text • Default system field</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#66736F]">text</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-[#DDE5E2] bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#17211F]">Email Address</span>
                        <span className="text-[10px] font-mono text-[#F04A24] bg-[#FDEEEA] px-1.5 py-0.2 rounded border border-[#F04A24]/30 font-semibold">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-[#66736F] text-[11px]">Pass will be dispatched here</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#66736F]">email</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-[#DDE5E2] bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#17211F]">University / Organization ID</span>
                        <span className="text-[10px] font-mono text-[#F04A24] bg-[#FDEEEA] px-1.5 py-0.2 rounded border border-[#F04A24]/30 font-semibold">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-[#66736F] text-[11px]">e.g. Student roll number or employee code</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#66736F]">text</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-[#DDE5E2] bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#17211F]">Workshop Track Selection</span>
                        <span className="text-[10px] font-mono text-[#F04A24] bg-[#FDEEEA] px-1.5 py-0.2 rounded border border-[#F04A24]/30 font-semibold">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-[#66736F] text-[11px]">Dropdown • 3 choices (AI Systems, Cloud Infra, UI/UX)</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#66736F]">dropdown</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-[#DDE5E2] bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#17211F]">Dietary Preferences</span>
                        <span className="text-[10px] font-mono text-[#52615D] bg-[#F5F7F8] px-1.5 py-0.2 rounded border border-[#DDE5E2]">
                          OPTIONAL
                        </span>
                      </div>
                      <p className="text-[#66736F] text-[11px]">Vegetarian, Halal, Allergies</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#66736F]">text</span>
                  </div>
                </div>

                {/* Live Public Form Preview */}
                <div className="md:col-span-5 p-5 rounded-lg bg-[#F5F7F8] border border-[#DDE5E2] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DDE5E2]">
                    <span className="text-[11px] font-mono uppercase text-[#52615D] font-semibold">Attendee View Preview</span>
                    <span className="text-[10px] text-[#66736F]">events/colloquium/register</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#17211F]">Workshop Track *</label>
                      <select className="w-full h-8 px-2.5 rounded border border-[#DDE5E2] bg-white text-[#17211F] text-xs" disabled defaultValue="Track A: Distributed Systems">
                        <option value="Track A: Distributed Systems">Track A: Distributed Systems</option>
                        <option value="Track B: AI Engineering">Track B: AI Engineering</option>
                        <option value="Track C: Product Design">Track C: Product Design</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#17211F]">University ID / Roll Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 2024-CSE-092"
                        className="w-full h-8 px-2.5 rounded border border-[#DDE5E2] bg-white text-[#17211F] text-xs placeholder:text-[#66736F]"
                        readOnly
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full h-8 rounded bg-[#006B5B] hover:bg-[#00564A] text-white text-xs font-medium cursor-default transition-colors shadow-2xs"
                      >
                        Submit Registration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Payment Approvals */}
          {activeLens === "payments" && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE5E2]/60">
                <div>
                  <h3 className="text-lg font-bold text-[#17211F]">Manual Payment Verification Queue</h3>
                  <p className="text-xs text-[#66736F]">
                    Verify direct attendee transfers (bKash, Nagad, Rocket, Bank) before releasing passes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#FFF8E7] text-[#17211F] border border-[#FFBE2E] font-medium">
                    2 Pending Review
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Payment Item 1: Pending review */}
                <div className="p-4 rounded-lg border border-[#FFBE2E]/70 bg-[#FFF8E7]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#17211F]">Nayeem Ahmed</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#17211F] text-white font-medium">
                        ৳ 500 BDT
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFBE2E] text-[#17211F] font-semibold border border-[#EAA81D]">
                        SUBMITTED
                      </span>
                    </div>
                    <p className="text-[#52615D] text-[11px]">
                      Method: <span className="font-semibold text-[#17211F]">bKash Personal</span> • Sender:{" "}
                      <span className="font-mono text-[#17211F]">01712-XXXXXX</span>
                    </p>
                    <p className="font-mono text-[#66736F] text-[11px]">
                      Transaction ID: <span className="text-[#17211F] font-semibold">9M40LA921</span> • 12 mins ago
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded bg-[#006B5B] text-white font-medium hover:bg-[#00564A] transition-colors shadow-2xs cursor-pointer"
                    >
                      Approve &amp; Issue Ticket
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded border border-[#DDE5E2] bg-white text-[#52615D] hover:text-[#17211F] hover:bg-[#F5F7F8] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Payment Item 2: Pending review */}
                <div className="p-4 rounded-lg border border-[#FFBE2E]/70 bg-[#FFF8E7]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#17211F]">Farhana Sultana</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#17211F] text-white font-medium">
                        ৳ 500 BDT
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFBE2E] text-[#17211F] font-semibold border border-[#EAA81D]">
                        SUBMITTED
                      </span>
                    </div>
                    <p className="text-[#52615D] text-[11px]">
                      Method: <span className="font-semibold text-[#17211F]">Nagad Merchant</span> • Sender:{" "}
                      <span className="font-mono text-[#17211F]">01834-XXXXXX</span>
                    </p>
                    <p className="font-mono text-[#66736F] text-[11px]">
                      Transaction ID: <span className="text-[#17211F] font-semibold">NG-781902</span> • 28 mins ago
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded bg-[#006B5B] text-white font-medium hover:bg-[#00564A] transition-colors shadow-2xs cursor-pointer"
                    >
                      Approve &amp; Issue Ticket
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded border border-[#DDE5E2] bg-white text-[#52615D] hover:text-[#17211F] hover:bg-[#F5F7F8] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Payment Item 3: Approved item */}
                <div className="p-4 rounded-lg border border-[#DDE5E2] bg-[#F5F7F8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs opacity-80">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#17211F]">Zubair Karim</span>
                      <span className="text-[10px] font-mono text-[#52615D]">৳ 500</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/30 font-medium">
                        APPROVED
                      </span>
                    </div>
                    <p className="font-mono text-[#66736F] text-[11px]">
                      TrxID: BK-3891024 • Pass #TK-90801 issued automatically to zubair@example.com
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#66736F]">Verified by Admin</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Gate Scanner */}
          {activeLens === "scanner" && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE5E2]/60">
                <div>
                  <h3 className="text-lg font-bold text-[#17211F]">Gate Turnstile Scanner</h3>
                  <p className="text-xs text-[#66736F]">
                    Runs in any phone browser. Atomic check-in locks duplicate entries instantly.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#006B5B] text-white font-medium">
                    Gate 1 Scanner
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Turnstile Camera Frame Simulation */}
                <div className="md:col-span-6 rounded-xl bg-[#102A26] text-white p-5 border border-[#1E4741] space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#DDE5E2] font-mono pb-2 border-b border-[#1E4741]">
                    <div className="flex items-center gap-1.5 text-[#38A394]">
                      <span className="h-2 w-2 rounded-full bg-[#38A394] animate-pulse" />
                      <span>TURNSTILE ACTIVE</span>
                    </div>
                    <span>0.15s SCAN SPEED</span>
                  </div>

                  {/* Viewfinder Target */}
                  <div className="h-48 rounded-lg border-2 border-dashed border-[#1E4741] flex flex-col items-center justify-center relative overflow-hidden bg-[#163631]/60">
                    <div className="w-24 h-24 rounded border-2 border-[#006B5B] flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-[#38A394]" />
                    </div>
                    <p className="text-[11px] font-mono text-[#DDE5E2] mt-3">
                      Position QR code in center of viewfinder
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#DDE5E2]/80">
                    <span>Outdoor Sunlight Mode: Enabled</span>
                    <span>Torch: Ready</span>
                  </div>
                </div>

                {/* Right: Instant Turnstile Result */}
                <div className="md:col-span-6 space-y-3">
                  <div className="p-4 rounded-xl bg-[#EDF4F2] border border-[#006B5B]/40 space-y-2">
                    <div className="flex items-center gap-2 text-[#006B5B]">
                      <CheckCircle2 className="h-5 w-5 text-[#006B5B]" />
                      <span className="font-bold text-sm">VALID ENTRANCE PASS</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#17211F]">
                      <p className="font-semibold text-sm">Dr. Tariq Anam</p>
                      <p className="font-mono text-[#006B5B] font-medium">Pass #TK-90812-B1 • Keynote Speaker</p>
                      <p className="text-[11px] text-[#52615D] font-mono pt-1">
                        Admitted at Gate 1 • Turnstile Concurrency Locked
                      </p>
                    </div>
                  </div>

                  {/* Duplicate protection warning preview (Amber) */}
                  <div className="p-4 rounded-xl bg-[#FFF8E7] border border-[#FFBE2E] space-y-1.5 text-xs text-[#17211F]">
                    <div className="flex items-center gap-2 font-bold text-[#B96B08]">
                      <AlertTriangle className="h-4 w-4 text-[#B96B08]" />
                      <span>ALREADY CHECKED IN (Screenshot Blocked)</span>
                    </div>
                    <p className="text-[11px] text-[#52615D] leading-normal">
                      Pass #TK-90812 was admitted 4 minutes ago at Gate 1. Second scan automatically flagged and rejected.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-[#DDE5E2] bg-white text-xs text-[#52615D] space-y-1">
                    <span className="font-mono text-[#17211F] font-semibold text-[11px] block">
                      Volunteer Delegation Safety
                    </span>
                    <p className="text-[11px] text-[#66736F] leading-normal">
                      Door volunteers only see name, pass validity, and category. No financial metrics, database exports, or organizer passwords.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
