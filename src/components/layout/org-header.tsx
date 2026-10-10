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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <Link href="/verify">
          <Button variant="outline" size="sm" className="font-medium text-xs gap-1.5 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
            <span className="hidden sm:inline">Verify Entrance</span>
            <span className="sm:hidden">Verify</span>
          </Button>
        </Link>

        <Link href="/org/events/new">
          <Button size="sm" className="font-semibold text-xs gap-1.5 shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
