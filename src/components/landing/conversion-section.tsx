"use client";

import Link from "next/link";
import { ArrowRight, Ticket, ArrowUpRight } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function ConversionSection() {
  const { openDemoModal } = useDemoModal();

  return (
    <section className="py-24 sm:py-36 bg-[#fbfbf9] relative border-b border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
        
        {/* Minimal Brand Seal */}
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white shadow-xs mx-auto">
          <Ticket className="h-6 w-6 text-zinc-100" />
        </div>

        {/* Confident Typographic Close */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08]">
            Make your next event{" "}
            <span className="font-editorial italic font-normal text-zinc-800">
              easier to run.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Bring your event setup, registrations, and tickets into one organized workflow.
          </p>
        </div>

        {/* Action Pair */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={openDemoModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <span>Get demo</span>
            <ArrowRight className="h-4 w-4 text-zinc-400" />
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-md bg-white border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            <span>Sign in to workspace</span>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </Link>
        </div>

        {/* Micro guarantees */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-500">
          <span>Free for community gatherings</span>
          <span>•</span>
          <span>Zero attendee accounts</span>
          <span>•</span>
          <span>Deploy in minutes</span>
        </div>

      </div>
    </section>
  );
}
