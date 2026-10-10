"use client";

import Link from "next/link";
import { Menu, Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrgHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function OrgHeader({
  onMenuToggle,
  title = "Dashboard",
  breadcrumbs,
}: OrgHeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-15 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-zinc-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-zinc-900">{crumb.label}</span>
                  )}
                  {!isLast && <span className="text-zinc-300">/</span>}
                </span>
              );
            })}
          </nav>
        ) : (
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
        )}
      </div>

      {/* Right: Search trigger & Create Event Action */}
      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs text-zinc-400 font-sans shadow-2xs">
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span>Quick filter...</span>
          <kbd className="text-[10px] font-mono bg-white border border-zinc-200 px-1.5 py-0.2 rounded-sm text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        <Link href="/org/events/new">
          <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
