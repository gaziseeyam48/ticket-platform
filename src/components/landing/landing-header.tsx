"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";
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
          ? "bg-white/90 backdrop-blur-md border-b border-[#DDE5E2] shadow-2xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded-md"
        >
          <div className="h-10 w-10 rounded-xl bg-white border border-[#DDE5E2] p-1 flex items-center justify-center shadow-2xs transition-all group-hover:scale-105 group-hover:border-[#006B5B]/50 shrink-0">
            <Image
              src="/logo.png"
              alt="TicketKoi Logo"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight text-[#17211F] leading-tight">
              TicketKoi
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#66736F]">
              Event Operations
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#52615D]"
        >
          <a
            href="#product-preview"
            className="hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded px-1"
          >
            Product
          </a>
          <a
            href="#workflow"
            className="hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded px-1"
          >
            Workflow
          </a>
          <a
            href="#capabilities"
            className="hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded px-1"
          >
            Capabilities
          </a>
          <a
            href="#who-its-for"
            className="hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded px-1"
          >
            Who It&apos;s For
          </a>
          <Link
            href="/verify"
            className="hover:text-[#006B5B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] rounded px-1 text-[#52615D] flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B]" />
            Gate Scanner
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[#52615D] hover:text-[#006B5B] transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={openDemoModal}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-[#006B5B] text-white text-sm font-medium hover:bg-[#00564A] transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <span>Get demo</span>
            <ArrowRight className="h-3.5 w-3.5 text-white/80" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-[#17211F] hover:text-[#006B5B] hover:bg-[#F5F7F8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5B]"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#DDE5E2] bg-white px-6 py-5 space-y-4 shadow-lg animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#17211F]">
            <a
              href="#product-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#DDE5E2] hover:text-[#006B5B]"
            >
              Product
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#DDE5E2] hover:text-[#006B5B]"
            >
              Workflow
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#DDE5E2] hover:text-[#006B5B]"
            >
              Capabilities
            </a>
            <a
              href="#who-its-for"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#DDE5E2] hover:text-[#006B5B]"
            >
              Who It&apos;s For
            </a>
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#DDE5E2] flex items-center justify-between text-[#52615D] hover:text-[#006B5B]"
            >
              <span>Gate Scanner</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20">
                Staff Link
              </span>
            </Link>
          </nav>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-[#17211F] hover:text-[#006B5B] border border-[#DDE5E2] hover:bg-[#F5F7F8] hover:border-[#006B5B] rounded-md transition-colors"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openDemoModal();
              }}
              className="w-full text-center py-2.5 text-sm font-medium text-white bg-[#006B5B] rounded-md hover:bg-[#00564A] transition-colors cursor-pointer"
            >
              Get demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
