"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Calendar, PlusCircle, ShieldCheck, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuickActionLinksProps {
  slug: string;
}

export function QuickActionLinks({ slug }: QuickActionLinksProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyOrgLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/events/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Link
        href="/org/events/new"
        className="group p-4 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors">
            Create →
          </span>
        </div>
        <div className="mt-3">
          <div className="text-sm font-semibold text-zinc-900">New Event</div>
          <div className="text-xs text-zinc-500 mt-0.5">Set up tickets and registration</div>
        </div>
      </Link>

      <Link
        href="/verify"
        className="group p-4 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <QrCode className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors">
            Launch →
          </span>
        </div>
        <div className="mt-3">
          <div className="text-sm font-semibold text-zinc-900">Gate Check-in</div>
          <div className="text-xs text-zinc-500 mt-0.5">Scan attendee passes at entrance</div>
        </div>
      </Link>

      <Link
        href="/org/audit-logs"
        className="group p-4 rounded-xl border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-600 transition-colors">
            View →
          </span>
        </div>
        <div className="mt-3">
          <div className="text-sm font-semibold text-zinc-900">Activity Logs</div>
          <div className="text-xs text-zinc-500 mt-0.5">Review check-in audit history</div>
        </div>
      </Link>
    </div>
  );
}
