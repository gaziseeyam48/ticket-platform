"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Users,
  Calendar,
  Smartphone,
  Search,
  Volume2,
  Sun,
  Flashlight,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
  Clock,
  Building,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [scannerDemoState, setScannerDemoState] = useState<"valid" | "duplicate" | "sunlight">("valid");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleStartWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      router.push(`/signup?email=${encodeURIComponent(emailInput.trim())}`);
    } else {
      router.push("/signup");
    }
  };

  const faqs = [
    {
      q: "Do my attendees need to download an app or create an account?",
      a: "No! Your guests never have to download anything or remember a password. When they register, their digital ticket pass opens directly in their browser and arrives instantly in their email. They can save it to their phone or show it at the door.",
    },
    {
      q: "Can my staff and volunteers scan tickets without seeing my private data?",
      a: "Yes! You can invite door staff with a simple 1-click link. They can open the scanner on their own phones and verify tickets immediately, without having access to your financial dashboard or guest lists.",
    },
    {
      q: "What happens if someone tries to use a ticket twice?",
      a: "The scanner instantly flashes yellow, plays a warning sound, and tells you the exact time that ticket was already used. It's physically impossible for the same ticket to be admitted twice.",
    },
    {
      q: "Can I collect custom information from guests, like dietary needs or job titles?",
      a: "Absolutely. With our simple form builder, you can add any questions you need—multiple choice, text, phone numbers, or checkboxes—in just a few clicks.",
    },
    {
      q: "Does the scanner work outdoors in bright sunlight or at night?",
      a: "Yes! Every ticket includes a one-tap 'Outdoor Brightness' mode for direct sunlight, and the door scanner includes a built-in flashlight toggle for low-light evening venues.",
    },
    {
      q: "How much does it cost?",
      a: "TicketPlatform is 100% free forever for free community events, meetups, and gatherings. For paid events, you can collect payments directly with zero hidden platform cuts.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-zinc-50 antialiased">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION BAR                                                 */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#fafaf8]/85 backdrop-blur-md border-b border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Ticket className="h-5 w-5 text-zinc-100" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-zinc-900">
              TicketPlatform
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">
              How it works
            </a>
            <a href="#scanner" className="hover:text-zinc-900 transition-colors">
              Door Scanner
            </a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-zinc-900 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 px-2 py-1 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="rounded-full px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                Create Free Event
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 2. HERO SECTION WITH FLOATING VISUAL CARDS                            */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle background radial dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(#d4d4d8 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          {/* Main Hero Header Center */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 shadow-2xs text-xs font-semibold text-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Event ticketing made delightfully simple</span>
              <span className="text-zinc-300">|</span>
              <span className="text-emerald-700 font-bold">100% Free to Start</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] sm:leading-[1.12]">
              Create, sell, and check in tickets.{" "}
              <span className="text-zinc-500 font-normal">All in one place.</span>
            </h1>

            {/* Human-friendly Subheadline */}
            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              No apps to download. No accounts or passwords for your guests. Create your event
              page in 2 minutes and scan tickets at the door with any phone camera.
            </p>

            {/* Lead Capture Form */}
            <div className="pt-2 max-w-md mx-auto">
              <form
                onSubmit={handleStartWithEmail}
                className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-sm focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all"
              >
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email to get started..."
                  aria-label="Enter your email address"
                  className="flex-1 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent focus:outline-none"
                />
                <Button
                  type="submit"
                  className="h-11 px-6 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs gap-1.5"
                >
                  Start For Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>

              {/* Trust Badges under CTA */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Free forever for free events
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Ready in 2 minutes
                </span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* FLOATING PRODUCT PREVIEWS (ChronoTask & Finpay inspired)         */}
          {/* ----------------------------------------------------------------- */}
          <div className="mt-14 sm:mt-16 relative max-w-5xl mx-auto">
            {/* Background subtle pedestal card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-xl space-y-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                      Live Event Control Center
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Everything updates in real time as guests arrive
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Gate Live • 94% Checked In
                  </span>
                </div>
              </div>

              {/* Hero Feature 3-Column Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Attendee Pass Preview Widget */}
                <div className="p-5 rounded-2xl bg-[#fafaf8] border border-zinc-200/80 space-y-4 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Digital Guest Pass
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  {/* Mini Ticket Card */}
                  <div className="p-3 bg-white rounded-xl border border-zinc-200 text-center space-y-2 shadow-2xs">
                    <div className="mx-auto w-24 h-24 p-1.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-zinc-900" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Alex Rivera</p>
                      <p className="text-[11px] font-mono text-zinc-500">Pass #TKT-88210</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Opens in 1 click from guest email. Zero passwords or app installations required.
                  </p>
                </div>

                {/* 2. Fast Phone Scanner Widget */}
                <div className="p-5 rounded-2xl bg-zinc-950 text-white space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Door Scanner
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Ready
                    </span>
                  </div>

                  {/* Simulated scanner viewfinder */}
                  <div className="relative aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center gap-2 border border-emerald-500/40">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white">Valid Pass</p>
                        <p className="text-[10px] text-emerald-200">Admitted in 0.4s</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Turn any iPhone or Android camera into a lightning-fast gate scanner.
                  </p>
                </div>

                {/* 3. Live Stats & Headcount */}
                <div className="p-5 rounded-2xl bg-[#fafaf8] border border-zinc-200/80 space-y-4 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Attendance Pulse
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Real-time
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-2.5 shadow-2xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-zinc-500">Admitted Today</span>
                      <span className="text-lg font-bold text-zinc-900">376 / 400</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Recent scans</span>
                      <span className="text-emerald-700 font-semibold">+18 in last 5m</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Always know who is in the venue. Export attendee logs anytime in CSV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. TRUSTED SOCIAL PROOF LOGO STRIP                                    */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-10 border-y border-zinc-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Trusted by modern event creators, universities, tech conferences, and meetups
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-2 text-zinc-400 text-sm font-bold tracking-tight">
            <span className="hover:text-zinc-800 transition-colors flex items-center gap-1.5">
              <Building className="h-4 w-4" /> Global Tech Summit
            </span>
            <span className="hover:text-zinc-800 transition-colors flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> DesignFest 2026
            </span>
            <span className="hover:text-zinc-800 transition-colors flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Campus Community
            </span>
            <span className="hover:text-zinc-800 transition-colors flex items-center gap-1.5">
              <Ticket className="h-4 w-4" /> Indie Creators
            </span>
            <span className="hover:text-zinc-800 transition-colors flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> City Dev Meetup
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. KEY BENEFITS / FEATURES (Simple Words)                             */}
      {/* --------------------------------------------------------------------- */}
      <section id="features" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Why Organizers Switch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Ticketing without the headache.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600">
            Everything you need to host a flawless event, without confusing menus or expensive hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
              <Users className="h-5 w-5 text-zinc-800" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Zero-Friction Signups</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Guests never sign up for an account or remember passwords. They simply enter their details and get their ticket pass immediately.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
              <Camera className="h-5 w-5 text-zinc-800" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Instant Phone Scanning</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Scan tickets in under 1 second with any smartphone camera. Plays a pleasant chime on success and vibrates on duplicate passes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
              <Share2 className="h-5 w-5 text-zinc-800" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">1-Click Volunteer Links</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Need helpers at the door? Send volunteers a secure scan link. They can check guests in without seeing your finances or guest records.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3 hover:shadow-sm transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
              <ShieldCheck className="h-5 w-5 text-zinc-800" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Double-Scan Protection</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Once a ticket is scanned at any door, it is instantly locked. Duplicate screenshots or forwarded passes are caught right at the gate.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. INTERACTIVE DOOR SCANNER SPOTLIGHT (Dark Section, Finpay inspired) */}
      {/* --------------------------------------------------------------------- */}
      <section id="scanner" className="py-16 sm:py-24 bg-zinc-900 text-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Turnstile Gate Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The easiest door check-in your team has ever used.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              No training manuals required. Hand any volunteer a phone and watch guests breeze through the entrance in seconds.
            </p>
          </div>

          {/* Interactive Demo Viewport Container */}
          <div className="p-6 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 max-w-4xl mx-auto shadow-2xl space-y-8">
            {/* Interactive Demo State Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              <button
                type="button"
                onClick={() => setScannerDemoState("valid")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scannerDemoState === "valid"
                    ? "bg-emerald-500 text-zinc-950 shadow-md"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                ✓ Valid Pass Scan
              </button>
              <button
                type="button"
                onClick={() => setScannerDemoState("duplicate")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scannerDemoState === "duplicate"
                    ? "bg-amber-400 text-zinc-950 shadow-md"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                ⚠️ Duplicate Scan Alert
              </button>
              <button
                type="button"
                onClick={() => setScannerDemoState("sunlight")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scannerDemoState === "sunlight"
                    ? "bg-white text-zinc-950 shadow-md"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                ☀️ Outdoor Sunlight Mode
              </button>
            </div>

            {/* Interactive Showcase Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left Side: Mock Scanner View */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-5">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-emerald-400" />
                    Phone Viewfinder
                  </span>
                  <span className="text-[11px] font-mono">Camera: Rear 1080p</span>
                </div>

                {scannerDemoState === "valid" && (
                  <div className="p-6 rounded-2xl bg-emerald-600 text-white space-y-3 animate-in zoom-in-95 duration-150">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-white" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200">
                        Access Granted
                      </p>
                      <h4 className="text-2xl font-bold">David Clark</h4>
                      <p className="text-xs text-emerald-100 font-mono">Pass #TKT-99812</p>
                    </div>
                    <div className="text-[11px] p-2 rounded-lg bg-black/20 font-medium">
                      Admitted at Gate 1 • Pleasant Two-Tone Chime
                    </div>
                  </div>
                )}

                {scannerDemoState === "duplicate" && (
                  <div className="p-6 rounded-2xl bg-amber-500 text-zinc-950 space-y-3 animate-in zoom-in-95 duration-150">
                    <AlertTriangle className="h-12 w-12 mx-auto text-zinc-950" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-extrabold text-amber-950">
                        Duplicate Entrance Scan!
                      </p>
                      <h4 className="text-2xl font-bold">Already Checked In!</h4>
                      <p className="text-xs text-amber-950 font-medium">
                        Attendee: David Clark (#TKT-99812)
                      </p>
                    </div>
                    <div className="text-[11px] p-2 rounded-lg bg-black/10 font-bold">
                      Prior scan recorded 3 mins ago • Warning Buzz Alert
                    </div>
                  </div>
                )}

                {scannerDemoState === "sunlight" && (
                  <div className="p-6 rounded-2xl bg-white text-zinc-950 space-y-3 animate-in zoom-in-95 duration-150 border-4 border-black">
                    <Sun className="h-12 w-12 mx-auto text-amber-500" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                        Outdoor Max-Contrast Active
                      </p>
                      <h4 className="text-xl font-bold">Direct Sunlight Scan</h4>
                      <p className="text-xs text-zinc-600">
                        Deep jet-black QR contrast for outdoor gates under the sun.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-zinc-400">
                  Works on Safari, Chrome, and any modern mobile browser.
                </p>
              </div>

              {/* Right Side: Feature bullets */}
              <div className="space-y-5 text-sm">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    Instant Audio & Vibration Feedback
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Gatekeepers don't even have to stare at the screen. A pleasant chime confirms access, and a distinct tone alerts on errors.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Flashlight className="h-4 w-4 text-amber-400" />
                    Built-in Flashlight Toggle
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Hosting an evening concert, gala, or club night? Staff can turn on their phone torch right from the scanning screen.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    Handheld Laser Barcode Gun Support
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Plug any USB or Bluetooth laser scanner into a laptop for rapid turnstile admissions over 60 guests per minute.
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/signup">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs h-11 rounded-xl shadow-lg cursor-pointer">
                      Try The Scanner On Your Event →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. HOW IT WORKS (3 Simple Steps)                                      */}
      {/* --------------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Simple 3-Step Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-zinc-600">
            You're ready to welcome attendees in less time than it takes to brew coffee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs space-y-4 relative">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white font-extrabold text-base flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Create your event page</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Pick your event title, date, venue, and questions. Choose free admission or enter your payment details for paid tickets.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              Takes ~2 minutes
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs space-y-4 relative">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white font-extrabold text-base flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Share your invite link</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Post your link on social media, in newsletters, or message groups. Guests sign up effortlessly and receive their QR pass right away.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              No guest app needed
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs space-y-4 relative">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white font-extrabold text-base flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Scan passes at the door</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Open your camera at the entrance. Scan guests in 1 second, prevent duplicate entries, and see live attendance update in real time.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
              Works on any smartphone
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. TRANSPARENT PRICING                                                */}
      {/* --------------------------------------------------------------------- */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Simple & Honest Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Transparent, straightforward pricing.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              No hidden checkout surcharges. No surprises for your attendees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-[#fafaf8] border border-zinc-200 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Free Events & Gatherings
                </span>
                <div className="space-y-1">
                  <div className="text-4xl font-extrabold text-zinc-900">$0</div>
                  <p className="text-xs text-zinc-500">Free forever for community events</p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited free attendees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>QR ticket pass generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited phone scanner staff</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Custom registration questions</span>
                  </li>
                </ul>
              </div>

              <Link href="/signup">
                <Button variant="outline" className="w-full h-11 text-xs font-bold rounded-xl cursor-pointer">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Paid & Pro Plan */}
            <div className="p-8 rounded-3xl bg-zinc-900 text-white space-y-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Paid & Large Events
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950">
                    Popular
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl font-extrabold text-white">Direct Pay</div>
                  <p className="text-xs text-zinc-400">Keep 100% of your earnings</p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Direct bank transfer / payment verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Zero platform fee deductions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Direct admin manual pass issuance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Complete audit logging & data exports</span>
                  </li>
                </ul>
              </div>

              <Link href="/signup">
                <Button className="w-full bg-white hover:bg-zinc-100 text-zinc-950 h-11 text-xs font-bold rounded-xl cursor-pointer shadow-md">
                  Create Your Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ)                                   */}
      {/* --------------------------------------------------------------------- */}
      <section id="faq" className="py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Frequently asked questions
          </h2>
          <p className="text-sm text-zinc-600">
            Everything you need to know about using TicketPlatform.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-zinc-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 9. BOTTOM HIGH-CONVERTING LEAD GENERATION CTA                         */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto p-8 sm:p-14 rounded-3xl bg-zinc-900 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Host Your Best Event Yet
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to host your next event?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Create your event page today. Set up in less than 2 minutes and start welcoming your guests with zero stress.
            </p>
          </div>

          <div className="pt-2 max-w-md mx-auto relative">
            <form
              onSubmit={handleStartWithEmail}
              className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-sm focus-within:border-zinc-500 transition-all"
            >
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email..."
                aria-label="Enter your email to create an event"
                className="flex-1 px-4 py-3 text-sm text-white placeholder:text-zinc-500 bg-transparent focus:outline-none"
              />
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold shrink-0 cursor-pointer shadow-md gap-1.5"
              >
                Create Event Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            <p className="text-[11px] text-zinc-500 pt-3 font-medium">
              Free to start • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 10. CLEAN MODERN FOOTER                                               */}
      {/* --------------------------------------------------------------------- */}
      <footer className="border-t border-zinc-200 bg-white py-12 px-4 sm:px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              <Ticket className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-zinc-900 text-sm">TicketPlatform</span>
            <span className="text-zinc-300">|</span>
            <span>Simple, fast event ticketing</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-xs">
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Organizer Login
            </Link>
            <Link href="/signup" className="hover:text-zinc-900 transition-colors">
              Create Account
            </Link>
            <Link href="/verify" className="hover:text-zinc-900 transition-colors">
              Gate Scanner
            </Link>
            <Link href="/org" className="hover:text-zinc-900 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-zinc-100 text-center sm:text-left text-[11px] text-zinc-400 flex flex-col sm:flex-row justify-between gap-2">
          <p>© 2026 TicketPlatform. All rights reserved.</p>
          <p>Designed for fast guest entry, clean passes, and zero duplicate check-ins.</p>
        </div>
      </footer>
    </div>
  );
}
