"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, Menu, X, ArrowRight } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal-context";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openDemoModal } = useDemoModal();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#fbfbf9]/90 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded-md"
        >
          <div className="h-9 w-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <Ticket className="h-4.5 w-4.5 text-zinc-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-zinc-900 leading-tight">
              TicketKoi
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Event Operations
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600"
        >
          <a
            href="#product-preview"
            className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded px-1"
          >
            Product
          </a>
          <a
            href="#workflow"
            className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded px-1"
          >
            Workflow
          </a>
          <a
            href="#capabilities"
            className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded px-1"
          >
            Capabilities
          </a>
          <a
            href="#who-its-for"
            className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded px-1"
          >
            Who It&apos;s For
          </a>
          <Link
            href="/verify"
            className="hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded px-1 text-zinc-500 flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Gate Scanner
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={openDemoModal}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <span>Get demo</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-[#fbfbf9] px-6 py-5 space-y-4 shadow-lg animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-zinc-800">
            <a
              href="#product-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-zinc-100"
            >
              Product
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-zinc-100"
            >
              Workflow
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-zinc-100"
            >
              Capabilities
            </a>
            <a
              href="#who-its-for"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-zinc-100"
            >
              Who It&apos;s For
            </a>
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-zinc-100 flex items-center justify-between text-zinc-600"
            >
              <span>Gate Scanner</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Staff Link
              </span>
            </Link>
          </nav>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 rounded-md"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openDemoModal();
              }}
              className="w-full text-center py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 cursor-pointer"
            >
              Get demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
