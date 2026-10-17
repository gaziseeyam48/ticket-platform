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
    <section id="product-preview" className="py-20 sm:py-32 bg-[#fbfbf9] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-500 uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
            <span>Product in Action</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Designed for the reality of event operations.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
            Inspect the four dedicated surfaces organizers use to plan, collect registrations, review transactions, and admit attendees.
          </p>
        </div>

        {/* Lens Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-zinc-200/80 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveLens("workspace")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              activeLens === "workspace"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/60"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Event Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLens("formBuilder")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              activeLens === "formBuilder"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/60"
            }`}
          >
            <FileEdit className="h-4 w-4" />
            <span>Form Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLens("payments")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              activeLens === "payments"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/60"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payment Approvals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLens("scanner")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              activeLens === "scanner"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/60"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Gate Scanner</span>
          </button>
        </div>

        {/* View Surface: Crisp, architectural, authentic */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
          
          {/* Top Window Meta Bar */}
          <div className="px-5 py-3.5 bg-[#fafaf8] border-b border-zinc-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-zinc-400">ticketkoi://app/</span>
              <span className="font-mono text-zinc-800 font-medium">
                {activeLens === "workspace" && "org/events/colloquium-2026"}
                {activeLens === "formBuilder" && "org/events/colloquium-2026/form"}
                {activeLens === "payments" && "org/events/colloquium-2026#payments"}
                {activeLens === "scanner" && "verify?event_id=colloquium-2026"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] text-zinc-500 uppercase">
                Synchronized
              </span>
            </div>
          </div>

          {/* Tab 1: Event Workspace & Capacity */}
          {activeLens === "workspace" && (
            <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                      Annual Technology & Policy Colloquium
                    </h3>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Created by IEEE Student Branch • Registration closed • Turnstiles active
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block">Status Transition</span>
                    <span className="text-xs font-semibold text-zinc-800">DRAFT → PUBLISHED → LIVE</span>
                  </div>
                </div>
              </div>

              {/* 4-Stat Metric Line */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Total Registered</span>
                  <p className="text-2xl font-bold font-mono text-zinc-900 mt-1">300</p>
                  <span className="text-xs text-zinc-500 mt-0.5 block">100% of capacity filled</span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Tickets Issued</span>
                  <p className="text-2xl font-bold font-mono text-zinc-900 mt-1">294</p>
                  <span className="text-xs text-emerald-600 mt-0.5 block">Delivered via inbox</span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Checked In</span>
                  <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">216</p>
                  <span className="text-xs text-zinc-500 mt-0.5 block">73.4% attendance rate</span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">Active Turnstiles</span>
                  <p className="text-2xl font-bold font-mono text-zinc-900 mt-1">3</p>
                  <span className="text-xs text-zinc-500 mt-0.5 block">Gate 1, Gate 2, VIP Door</span>
                </div>
              </div>

              {/* High-Density Attendee Table Preview */}
              <div>
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-500">
                    Live Attendee Registry
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Showing 4 of 300 records</span>
                </div>

                <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fafaf8] border-b border-zinc-200 text-zinc-500 font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Attendee</th>
                        <th className="py-2.5 px-4 font-medium">Ticket Pass</th>
                        <th className="py-2.5 px-4 font-medium">Category</th>
                        <th className="py-2.5 px-4 font-medium">Gate Status</th>
                        <th className="py-2.5 px-4 font-medium text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      <tr className="hover:bg-zinc-50">
                        <td className="py-3 px-4 font-medium text-zinc-900">Dr. Tariq Anam</td>
                        <td className="py-3 px-4 font-mono text-zinc-600">TK-90812-B1</td>
                        <td className="py-3 px-4 text-zinc-600">Keynote Speaker</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            Checked In (Gate 1)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400 text-right">09:14:22 AM</td>
                      </tr>
                      <tr className="hover:bg-zinc-50">
                        <td className="py-3 px-4 font-medium text-zinc-900">Sadia Chowdhury</td>
                        <td className="py-3 px-4 font-mono text-zinc-600">TK-90813-B2</td>
                        <td className="py-3 px-4 text-zinc-600">General Attendee</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            Checked In (Gate 2)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400 text-right">09:18:05 AM</td>
                      </tr>
                      <tr className="hover:bg-zinc-50">
                        <td className="py-3 px-4 font-medium text-zinc-900">Kamrul Hasan</td>
                        <td className="py-3 px-4 font-mono text-zinc-600">TK-90814-B3</td>
                        <td className="py-3 px-4 text-zinc-600">Student Pass</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            Issued (Awaiting Gate)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400 text-right">—</td>
                      </tr>
                      <tr className="hover:bg-zinc-50">
                        <td className="py-3 px-4 font-medium text-zinc-900">Mehnaz Parveen</td>
                        <td className="py-3 px-4 font-mono text-zinc-600">TK-90815-B4</td>
                        <td className="py-3 px-4 text-zinc-600">General Attendee</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            Checked In (Gate 1)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400 text-right">09:21:40 AM</td>
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
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Registration Form Schema</h3>
                  <p className="text-xs text-zinc-500">Configure questions attendees must answer during checkout.</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  5 Custom Fields
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Form Fields List */}
                <div className="md:col-span-7 space-y-3">
                  <div className="p-3.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">Full Name</span>
                        <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px]">Short text • Default system field</p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">text</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">Email Address</span>
                        <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px]">Pass will be dispatched here</p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">email</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">University / Organization ID</span>
                        <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px]">e.g. Student roll number or employee code</p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">text</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">Workshop Track Selection</span>
                        <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          REQUIRED
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px]">Dropdown • 3 choices (AI Systems, Cloud Infra, UI/UX)</p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">dropdown</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900">Dietary Preferences</span>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded">
                          OPTIONAL
                        </span>
                      </div>
                      <p className="text-zinc-500 text-[11px]">Vegetarian, Halal, Allergies</p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">text</span>
                  </div>
                </div>

                {/* Live Public Form Preview */}
                <div className="md:col-span-5 p-5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                    <span className="text-[11px] font-mono uppercase text-zinc-500 font-semibold">Attendee View Preview</span>
                    <span className="text-[10px] text-zinc-400">events/colloquium/register</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Workshop Track *</label>
                      <select className="w-full h-8 px-2.5 rounded border border-zinc-300 bg-white text-zinc-800 text-xs" disabled defaultValue="Track A: Distributed Systems">
                        <option value="Track A: Distributed Systems">Track A: Distributed Systems</option>
                        <option value="Track B: AI Engineering">Track B: AI Engineering</option>
                        <option value="Track C: Product Design">Track C: Product Design</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">University ID / Roll Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 2024-CSE-092"
                        className="w-full h-8 px-2.5 rounded border border-zinc-300 bg-white text-zinc-800 text-xs placeholder:text-zinc-400"
                        readOnly
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full h-8 rounded bg-zinc-900 text-white text-xs font-medium cursor-default"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Manual Payment Verification Queue</h3>
                  <p className="text-xs text-zinc-500">
                    Verify direct attendee transfers (bKash, Nagad, Rocket, Bank) before releasing passes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    2 Pending Review
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Payment Item 1: Pending review */}
                <div className="p-4 rounded-lg border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">Nayeem Ahmed</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-white">
                        ৳ 500 BDT
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        SUBMITTED
                      </span>
                    </div>
                    <p className="text-zinc-600 text-[11px]">
                      Method: <span className="font-semibold text-zinc-900">bKash Personal</span> • Sender:{" "}
                      <span className="font-mono">01712-XXXXXX</span>
                    </p>
                    <p className="font-mono text-zinc-500 text-[11px]">
                      Transaction ID: <span className="text-zinc-900 font-semibold">9M40LA921</span> • 12 mins ago
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors shadow-2xs"
                    >
                      Approve &amp; Issue Ticket
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded border border-zinc-300 bg-white text-zinc-600 hover:text-zinc-900"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Payment Item 2: Pending review */}
                <div className="p-4 rounded-lg border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">Farhana Sultana</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-white">
                        ৳ 500 BDT
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        SUBMITTED
                      </span>
                    </div>
                    <p className="text-zinc-600 text-[11px]">
                      Method: <span className="font-semibold text-zinc-900">Nagad Merchant</span> • Sender:{" "}
                      <span className="font-mono">01834-XXXXXX</span>
                    </p>
                    <p className="font-mono text-zinc-500 text-[11px]">
                      Transaction ID: <span className="text-zinc-900 font-semibold">NG-781902</span> • 28 mins ago
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors shadow-2xs"
                    >
                      Approve &amp; Issue Ticket
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded border border-zinc-300 bg-white text-zinc-600 hover:text-zinc-900"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Payment Item 3: Approved item */}
                <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs opacity-75">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">Zubair Karim</span>
                      <span className="text-[10px] font-mono text-zinc-500">৳ 500</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        APPROVED
                      </span>
                    </div>
                    <p className="font-mono text-zinc-500 text-[11px]">
                      TrxID: BK-3891024 • Pass #TK-90801 issued automatically to zubair@example.com
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Verified by Admin</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Gate Scanner */}
          {activeLens === "scanner" && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Gate Turnstile Scanner</h3>
                  <p className="text-xs text-zinc-500">
                    Runs in any phone browser. Atomic check-in locks duplicate entries instantly.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 text-white">
                    Gate 1 Scanner
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Turnstile Camera Frame Simulation */}
                <div className="md:col-span-6 rounded-xl bg-zinc-950 text-white p-5 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>TURNSTILE ACTIVE</span>
                    </div>
                    <span>0.15s SCAN SPEED</span>
                  </div>

                  {/* Viewfinder Target */}
                  <div className="h-48 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center relative overflow-hidden bg-zinc-900/40">
                    <div className="w-24 h-24 rounded border-2 border-emerald-500/80 flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-zinc-500" />
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400 mt-3">
                      Position QR code in center of viewfinder
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Outdoor Sunlight Mode: Enabled</span>
                    <span>Torch: Ready</span>
                  </div>
                </div>

                {/* Right: Instant Turnstile Result */}
                <div className="md:col-span-6 space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-sm">VALID ENTRANCE PASS</span>
                    </div>
                    <div className="space-y-1 text-xs text-emerald-950">
                      <p className="font-semibold text-sm">Dr. Tariq Anam</p>
                      <p className="font-mono text-emerald-800">Pass #TK-90812-B1 • Keynote Speaker</p>
                      <p className="text-[11px] text-emerald-700 font-mono pt-1">
                        Admitted at Gate 1 • Turnstile Concurrency Locked
                      </p>
                    </div>
                  </div>

                  {/* Duplicate protection warning preview */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>ALREADY CHECKED IN (Screenshot Blocked)</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-normal">
                      Pass #TK-90812 was admitted 4 minutes ago at Gate 1. Second scan automatically flagged and rejected.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-500 space-y-1">
                    <span className="font-mono text-zinc-900 font-semibold text-[11px] block">
                      Volunteer Delegation Safety
                    </span>
                    <p className="text-[11px] text-zinc-600 leading-normal">
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
