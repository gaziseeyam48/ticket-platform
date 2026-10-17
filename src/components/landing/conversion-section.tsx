"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function ConversionSection() {
  const { openDemoModal } = useDemoModal();

  return (
    <section className="py-24 sm:py-36 bg-[#EDF4F2] relative border-b border-[#DDE5E2]">
      <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
        
        {/* Brand Seal */}
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white border border-[#DDE5E2] p-2 shadow-xs mx-auto">
          <Image
            src="/logo.png"
            alt="TicketKoi Logo"
            width={44}
            height={44}
            className="h-10 w-10 object-contain"
          />
        </div>

        {/* Confident Typographic Close */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#17211F] leading-[1.08]">
            Make your next event{" "}
            <span className="font-editorial italic font-normal text-[#17211F]">
              easier to run.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#52615D] max-w-xl mx-auto leading-relaxed">
            Bring your event setup, registrations, and tickets into one organized workflow.
          </p>
        </div>

        {/* Action Pair */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={openDemoModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-md bg-[#006B5B] text-white text-sm font-medium hover:bg-[#00564A] transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <span>Get demo</span>
            <ArrowRight className="h-4 w-4 text-white/80" />
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md bg-white border border-[#DDE5E2] text-[#17211F] text-sm font-medium hover:bg-white hover:border-[#006B5B] hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
          >
            <span>Sign in to workspace</span>
            <ArrowUpRight className="h-4 w-4 text-[#52615D]" />
          </Link>
        </div>

        {/* Micro guarantees */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#52615D]">
          <span>Free for community gatherings</span>
          <span className="text-[#DDE5E2]">•</span>
          <span>Zero attendee accounts</span>
          <span className="text-[#DDE5E2]">•</span>
          <span>Deploy in minutes</span>
        </div>

      </div>
    </section>
  );
}
