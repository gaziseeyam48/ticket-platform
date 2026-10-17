"use client";

import Link from "next/link";
import Image from "next/image";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function LandingFooter() {
  const currentYear = 2026;
  const { openDemoModal } = useDemoModal();

  return (
    <footer className="bg-[#F5F7F8] text-[#52615D] border-t border-[#DDE5E2]">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded group"
            >
              <div className="h-9 w-9 rounded-lg bg-white border border-[#DDE5E2] p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="TicketKoi Logo"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="font-semibold text-lg tracking-tight text-[#17211F]">
                TicketKoi
              </span>
            </Link>

            <p className="text-sm text-[#52615D] max-w-sm leading-relaxed">
              Event management, custom registration forms, manual payment review, and turnstile verification built for real event organizers.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#66736F]">
              <span className="h-2 w-2 rounded-full bg-[#006B5B]" />
              <span>Production Systems Operational</span>
            </div>
          </div>

          {/* Links Col 1: Platform */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17211F] block">
              Platform
            </span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#product-preview" className="hover:text-[#006B5B] transition-colors">
                  Product Overview
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-[#006B5B] transition-colors">
                  Workflow Progression
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#006B5B] transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#who-its-for" className="hover:text-[#006B5B] transition-colors">
                  Who It&apos;s For
                </a>
              </li>
              <li>
                <Link href="/verify" className="hover:text-[#006B5B] transition-colors flex items-center gap-1.5">
                  <span>Gate Scanner</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20">
                    Live
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2: Organizers & Staff */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17211F] block">
              Organizer Workspace
            </span>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => openDemoModal("footer")}
                  data-umami-event="Get Demo Click"
                  data-umami-event-source="footer"
                  className="hover:text-[#006B5B] transition-colors cursor-pointer text-left"
                >
                  Request a Demo (Early Access)
                </button>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#006B5B] transition-colors">
                  Sign In to Workspace
                </Link>
              </li>
              <li>
                <Link href="/verify/auth" className="hover:text-[#006B5B] transition-colors">
                  Volunteer Staff Link Access
                </Link>
              </li>
            </ul>

            <div className="pt-4 border-t border-[#DDE5E2]/60 text-xs text-[#66736F] space-y-1">
              <span className="font-mono text-[#52615D] uppercase text-[10px] block font-semibold">
                Core Guarantees
              </span>
              <p className="text-[11px] leading-normal">
                Single-use QR locking, direct organizer payment receipt collection, and zero-leak staff permissions.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#DDE5E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66736F] font-mono">
          <p>© {currentYear} TicketKoi. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>•</span>
            <span className="text-[#17211F] font-medium">Built for Organizers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
