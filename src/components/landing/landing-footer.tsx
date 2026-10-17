"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function LandingFooter() {
  const currentYear = 2026;
  const { openDemoModal } = useDemoModal();

  return (
    <footer className="bg-[#fbfbf9] text-zinc-600 border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded"
            >
              <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <Ticket className="h-4 w-4 text-zinc-100" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-zinc-900">
                TicketKoi
              </span>
            </Link>

            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              Event management, custom registration forms, manual payment review, and turnstile verification built for real event organizers.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Production Systems Operational</span>
            </div>
          </div>

          {/* Links Col 1: Platform */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 block">
              Platform
            </span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#product-preview" className="hover:text-zinc-900 transition-colors">
                  Product Overview
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-zinc-900 transition-colors">
                  Workflow Progression
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-zinc-900 transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#who-its-for" className="hover:text-zinc-900 transition-colors">
                  Who It&apos;s For
                </a>
              </li>
              <li>
                <Link href="/verify" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5">
                  <span>Gate Scanner</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                    Live
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2: Organizers & Staff */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 block">
              Organizer Workspace
            </span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={openDemoModal}
                  className="hover:text-zinc-900 transition-colors cursor-pointer text-left"
                >
                  Request a Demo (Early Access)
                </button>
              </li>
              <li>
                <Link href="/login" className="hover:text-zinc-900 transition-colors">
                  Sign In to Workspace
                </Link>
              </li>
              <li>
                <Link href="/verify/auth" className="hover:text-zinc-900 transition-colors">
                  Volunteer Staff Link Access
                </Link>
              </li>
            </ul>

            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-400 space-y-1">
              <span className="font-mono text-zinc-500 uppercase text-[10px] block font-semibold">
                Core Guarantees
              </span>
              <p className="text-[11px] leading-normal">
                Single-use QR locking, direct organizer payment receipt collection, and zero-leak staff permissions.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <p>© {currentYear} TicketKoi. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>•</span>
            <span>Built for Organizers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
