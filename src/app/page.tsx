"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Users,
  Smartphone,
  Volume2,
  Sun,
  Flashlight,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
  Clock,
  Sparkles,
} from "lucide-react";
import { playScanSound } from "@/lib/utils/audio";

export default function HomePage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [activeScanDemo, setActiveScanDemo] = useState<"valid" | "duplicate">("valid");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Handle scroll progress
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Handle intersection observer for scroll reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal-hidden");
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleStartWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      router.push(`/signup?email=${encodeURIComponent(emailInput.trim())}`);
    } else {
      router.push("/signup");
    }
  };

  const handleSimulateScan = (type: "valid" | "duplicate") => {
    setActiveScanDemo(type);
    if (type === "valid") {
      playScanSound("VALID");
    } else {
      playScanSound("ALREADY_CHECKED_IN");
    }
  };

  const faqs = [
    {
      q: "Do guests need an app or an account?",
      a: "No. Guests never need to download anything or create a password. Their ticket pass arrives directly in their email and opens in any mobile browser with one tap.",
    },
    {
      q: "Can volunteers scan tickets without seeing my private data?",
      a: "Yes. You can generate a 1-click staff link. Staff open the scanner on their own phone and check guests in without accessing your ticket sales, bank details, or private guest database.",
    },
    {
      q: "What stops someone from copying or screenshotting a ticket?",
      a: "The instant a ticket is scanned at any entrance, the system permanently locks that ticket. If someone presents the same QR code again, the scanner immediately sounds a warning tone and displays the exact time it was already used.",
    },
    {
      q: "Can I ask custom questions when guests register?",
      a: "Yes. You can add any question you need—like dietary requirements, t-shirt size, company name, or phone numbers—with required or optional toggles.",
    },
    {
      q: "Does the scanner work outdoors in direct sunlight?",
      a: "Yes. Every ticket pass includes a 1-tap Outdoor Brightness Mode that maximizes QR contrast for bright daylight, and the scanner includes a flashlight toggle for dark evening venues.",
    },
    {
      q: "How much does it cost?",
      a: "TicketPlatform is completely free for free events. For paid events, you can collect payments directly with zero platform deductions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white antialiased">
      {/* Top Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] bg-zinc-200/40 pointer-events-none">
        <div
          className="h-full bg-blue-600 transition-[width] duration-75 ease-out shadow-[0_0_8px_rgba(37,99,235,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. CLEAN NAVIGATION (Minimal, spacious, no heavy borders)              */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#fcfcfb]/80 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Ticket className="h-4 w-4 text-zinc-100" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-900">
              TicketPlatform
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
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

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <button
                type="button"
                className="h-10 px-5 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Event
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 2. HERO SECTION (ChronoTask & Edgelabs Inspired: Pure aesthetic)       */}
      {/* --------------------------------------------------------------------- */}
      <section className="relative pt-12 pb-24 sm:pt-20 sm:pb-36 overflow-hidden">
        {/* Subtle radial dot backdrop */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(#e4e4e7 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Top Label & Tactile Icon (ChronoTask reference) */}
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center p-2.5">
              <div className="grid grid-cols-2 gap-1.5 w-full h-full">
                <div className="rounded-full bg-blue-500" />
                <div className="rounded-full bg-zinc-900" />
                <div className="rounded-full bg-zinc-900" />
                <div className="rounded-full bg-zinc-900" />
              </div>
            </div>
          </div>

          {/* Central Typographic Lede */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] text-zinc-900 leading-[1.08]">
              Think, host, and check in guests all in one place
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 max-w-xl mx-auto font-normal leading-relaxed">
              No apps to download. No passwords for your guests. Create your event page in minutes and scan tickets at the door with any phone camera.
            </p>

            {/* Email Lead Capture Box */}
            <div className="pt-2 max-w-md mx-auto">
              <form
                onSubmit={handleStartWithEmail}
                className="flex items-center p-1.5 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
              >
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email to get started..."
                  aria-label="Enter your email"
                  className="flex-1 px-5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xs"
                >
                  Get free demo
                </button>
              </form>

              <div className="pt-3 flex items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
                <span>Free for community events</span>
                <span>•</span>
                <span>No credit card needed</span>
                <span>•</span>
                <span>2-minute setup</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* ASYMMETRIC FLOATING ARTIFACTS (Direct ChronoTask & Finpay feel)    */}
          {/* ----------------------------------------------------------------- */}
          <div className="mt-16 sm:mt-24 relative max-w-4xl mx-auto min-h-[340px] hidden sm:block pointer-events-none select-none">
            {/* Artifact 1 (Top-Left): Yellow Sticky Note with Pushpin */}
            <div className="absolute left-2 -top-6 w-60 p-5 rounded-2xl bg-[#fff9c4] text-zinc-800 shadow-[0_12px_32px_rgba(0,0,0,0.08)] rotate-[-4deg] animate-float-slow">
              <div className="w-3 h-3 rounded-full bg-rose-500 mx-auto -mt-2 mb-3 shadow-xs" />
              <p className="text-xs font-medium leading-relaxed font-sans">
                Guests never create an account or remember passwords. Tickets arrive straight in their inbox.
              </p>
              <div className="mt-3 pt-2 border-t border-amber-300/60 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Zero friction</span>
                <span>✓ 100% delivered</span>
              </div>
            </div>

            {/* Artifact 2 (Top-Right): Clean Door Verification Card */}
            <div className="absolute right-4 -top-8 w-64 p-4 rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] rotate-[3deg] animate-float-delayed">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-[11px] font-medium text-zinc-400">Door Gate 1</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Scan
                </span>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Alex Rivera</p>
                  <p className="text-[11px] text-zinc-400 font-mono">Pass #TKT-88210 • 0.3s</p>
                </div>
              </div>
            </div>

            {/* Artifact 3 (Bottom-Left): Live Today's Event Progress Card */}
            <div className="absolute left-10 bottom-2 w-72 p-4 rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] rotate-[1.5deg] animate-float-delayed">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100">
                <span className="font-semibold text-zinc-800">Tech Summit 2026</span>
                <span className="text-zinc-400 text-[11px]">88% Capacity</span>
              </div>
              <div className="pt-2.5 space-y-1.5">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Admitted at gate</span>
                  <span className="font-bold text-zinc-900">248 / 280</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[88%]" />
                </div>
              </div>
            </div>

            {/* Artifact 4 (Bottom-Right): Digital QR Pass Tile */}
            <div className="absolute right-12 bottom-0 w-64 p-4 rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] rotate-[-2deg] animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 p-1.5 bg-zinc-50 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="h-10 w-10 text-zinc-900" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900">Verified Admission</p>
                  <p className="text-[11px] text-zinc-500">Works in bright sun or dim evening light</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. SUBTLE SOCIAL PROOF STRIP (Minimalist typography)                  */}
      {/* --------------------------------------------------------------------- */}
      <section className="reveal-hidden py-12 border-y border-zinc-200/50 bg-white/60">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-4">
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            Trusted by independent organizers, universities, and gatherings worldwide
          </p>

          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 text-zinc-400 text-sm font-semibold tracking-tight">
            <span className="hover:text-zinc-700 transition-colors">Global Tech Summit</span>
            <span className="hover:text-zinc-700 transition-colors">DesignFest 2026</span>
            <span className="hover:text-zinc-700 transition-colors">Campus Community</span>
            <span className="hover:text-zinc-700 transition-colors">City Dev Meetup</span>
            <span className="hover:text-zinc-700 transition-colors">Maker Gathering</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. THREE CORE EXPERIENCES (Edgelabs & Finpay Inspiration)             */}
      {/* --------------------------------------------------------------------- */}
      <section id="features" className="py-24 sm:py-32 max-w-6xl mx-auto px-6 space-y-20">
        <div className="reveal-hidden max-w-xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Simple by design
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Everything your event needs, nothing it doesn&apos;t
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Built for people who want to organize great gatherings, not wrestle with bloated software.
          </p>
        </div>

        {/* Feature 1: Seamless Guest Experience */}
        <div className="reveal-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
              01 • Guest Experience
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Your attendees never create an account
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Forced logins and password creation are the number one reason people drop out of registration forms. With TicketPlatform, your guests enter their name and email, and their ticket pass arrives in their inbox in seconds.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-zinc-600">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Instant ticket delivery straight to email</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Add directly to Apple Calendar or Google Calendar (.ics)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Works on any mobile device without downloading an app</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center space-y-4">
            <div className="max-w-xs mx-auto p-5 rounded-2xl bg-[#fcfcfb] border border-zinc-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-900">Global Tech Summit</span>
                <span className="text-emerald-700 font-medium">Valid Pass</span>
              </div>
              <div className="p-3 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="h-32 w-32 text-zinc-900" />
              </div>
              <p className="font-mono text-xs text-zinc-500">#TKT-99812 • Sarah Jenkins</p>
            </div>
            <p className="text-xs text-zinc-400">
              Ready to present at the gate with zero friction.
            </p>
          </div>
        </div>

        {/* Feature 2: Phone Camera Gate Scanning */}
        <div className="reveal-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-3 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <Camera className="h-4 w-4 text-emerald-400" />
                Live Door Scanner
              </span>
              <span className="font-mono text-zinc-400">0.3s Scan Speed</span>
            </div>

            <div className="relative aspect-video rounded-2xl bg-zinc-950 flex flex-col items-center justify-center text-center p-6 overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-white">Welcome, David Clark</p>
              <p className="text-xs text-emerald-300 font-mono">Pass Verified • Admitted</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
              <div className="p-2.5 rounded-xl bg-zinc-800/60">
                <span className="text-white font-medium block">Sound Chimes</span>
                Pleasant sound confirmation
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-800/60">
                <span className="text-white font-medium block">Flashlight Mode</span>
                Built-in for evening venues
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-4">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
              02 • Door Admission
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Scan tickets with any phone camera
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              No rented barcode guns or proprietary hardware. Any smartphone camera becomes a high-speed gate turnstile. Audio chimes confirm entry instantly, so staff never have to keep looking down.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-zinc-600">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Double-scan proof: Identical passes are instantly rejected</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Works outdoors in direct sunlight and in dim night venues</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Support for USB/Bluetooth laser barcode scanners</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Team Collaboration */}
        <div className="reveal-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
              03 • Staff Delegation
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Invite volunteers with a single link
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Running an event requires team help. Send a staff link to volunteers, greeters, or venue security. They can open their phone camera and start admitting guests immediately—without seeing your bank info, financial earnings, or private organizer settings.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-zinc-600">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>No volunteer account setup required</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Staff can only scan passes, keeping financial records private</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-zinc-900" />
                <span>Revoke staff access at any time with one click</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-4">
            <div className="p-4 rounded-2xl bg-[#fcfcfb] border border-zinc-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-zinc-900">Staff Scan Link</p>
                <p className="text-zinc-400 font-mono text-[11px]">tickets.platform/verify/staff-token</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-medium"
              >
                Copy Link
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Gatekeeper mode active: Financial reports and attendee data protected.</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. INTERACTIVE LIVE SCANNER SIMULATION (Sound + Haptic)                */}
      {/* --------------------------------------------------------------------- */}
      <section id="scanner" className="reveal-hidden py-24 sm:py-32 bg-zinc-950 text-white relative">
        <div className="max-w-4xl mx-auto px-6 space-y-12 text-center">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
              Live Interactive Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Try the door scanner right now
            </h2>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">
              Click below to test the sound cues and duplicate-ticket rejection system in real time.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSimulateScan("valid")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeScanDemo === "valid"
                  ? "bg-white text-zinc-950 shadow-md scale-105"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Simulate Valid Scan (Sound Chime)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateScan("duplicate")}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeScanDemo === "duplicate"
                  ? "bg-amber-400 text-zinc-950 shadow-md scale-105"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Simulate Duplicate Scan (Warning Tone)
            </button>
          </div>

          {/* Simulated Scanner Viewport */}
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-900 text-center space-y-4 shadow-2xl">
            {activeScanDemo === "valid" ? (
              <div className="p-6 rounded-2xl bg-emerald-600 text-white space-y-3 animate-in zoom-in-95 duration-150">
                <CheckCircle2 className="h-12 w-12 mx-auto text-white" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200">
                    Access Granted
                  </p>
                  <h4 className="text-2xl font-bold">David Clark</h4>
                  <p className="text-xs text-emerald-100 font-mono">Pass #TKT-99812</p>
                </div>
                <p className="text-xs text-emerald-100 font-medium">
                  Admitted at Gate 1 • Double Chime Played
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-500 text-zinc-950 space-y-3 animate-in zoom-in-95 duration-150">
                <AlertTriangle className="h-12 w-12 mx-auto text-zinc-950" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-extrabold text-amber-950">
                    Duplicate Scan Blocked!
                  </p>
                  <h4 className="text-2xl font-bold">Already Admitted</h4>
                  <p className="text-xs text-amber-950 font-medium">
                    This ticket was already checked in at 2:15 PM
                  </p>
                </div>
                <p className="text-xs text-amber-950 font-bold">
                  Warning alert played • Entrance refused
                </p>
              </div>
            )}

            <p className="text-xs text-zinc-500">
              Zero double-scans guaranteed. Works on any mobile browser.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. HOW IT WORKS (3 Simple Steps)                                      */}
      {/* --------------------------------------------------------------------- */}
      <section id="how-it-works" className="py-24 sm:py-32 max-w-6xl mx-auto px-6 space-y-16">
        <div className="reveal-hidden max-w-xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Getting Started
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            How it works in 3 simple steps
          </h2>
          <p className="text-sm text-zinc-500">
            You can launch your registration page in less time than it takes to brew coffee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="reveal-hidden reveal-stagger-1 p-8 rounded-3xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.04)] space-y-3">
            <span className="text-3xl font-extrabold text-zinc-200">01</span>
            <h3 className="text-lg font-bold text-zinc-900">Create your event</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Set your event title, date, location, and questions. Choose free admission or enter your payment instructions.
            </p>
          </div>

          <div className="reveal-hidden reveal-stagger-2 p-8 rounded-3xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.04)] space-y-3">
            <span className="text-3xl font-extrabold text-zinc-200">02</span>
            <h3 className="text-lg font-bold text-zinc-900">Share your link</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Guests sign up in 30 seconds. Their digital pass with a verified QR code lands straight in their email.
            </p>
          </div>

          <div className="reveal-hidden reveal-stagger-3 p-8 rounded-3xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.04)] space-y-3">
            <span className="text-3xl font-extrabold text-zinc-200">03</span>
            <h3 className="text-lg font-bold text-zinc-900">Scan at the door</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Open the scanner on any phone camera. Verify attendees in under 1 second with instant audio feedback.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. TRANSPARENT PRICING                                                */}
      {/* --------------------------------------------------------------------- */}
      <section id="pricing" className="py-20 sm:py-28 bg-white border-y border-zinc-200/50">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="reveal-hidden text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
              Simple, honest pricing
            </h2>
            <p className="text-sm text-zinc-500">
              No hidden checkout surcharges. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Tier */}
            <div className="reveal-hidden reveal-stagger-1 p-8 rounded-3xl bg-[#fcfcfb] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Community & Free Events
                </span>
                <div>
                  <div className="text-4xl font-bold text-zinc-900">$0</div>
                  <p className="text-xs text-zinc-500 mt-1">Free forever</p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-zinc-900 shrink-0" />
                    <span>Unlimited free attendees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-zinc-900 shrink-0" />
                    <span>QR ticket generation & delivery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-zinc-900 shrink-0" />
                    <span>Unlimited phone scanners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-zinc-900 shrink-0" />
                    <span>Custom registration questions</span>
                  </li>
                </ul>
              </div>

              <Link href="/signup">
                <button
                  type="button"
                  className="w-full h-11 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Start Free
                </button>
              </Link>
            </div>

            {/* Paid Tier */}
            <div className="reveal-hidden reveal-stagger-2 p-8 rounded-3xl bg-zinc-900 text-white space-y-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Paid Events
                </span>
                <div>
                  <div className="text-4xl font-bold text-white">Direct Pay</div>
                  <p className="text-xs text-zinc-400 mt-1">Zero platform deductions</p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Direct bank transfer collection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>1-click payment verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Direct admin ticket issuance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Full attendance audit logs</span>
                  </li>
                </ul>
              </div>

              <Link href="/signup">
                <button
                  type="button"
                  className="w-full h-11 rounded-full bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Create Event
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 8. FAQ ACCORDION                                                      */}
      {/* --------------------------------------------------------------------- */}
      <section id="faq" className="reveal-hidden py-24 sm:py-32 max-w-3xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Common questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-zinc-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-500 leading-relaxed border-t border-zinc-100/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 9. BOTTOM LEAD CAPTURE CALL TO ACTION                                 */}
      {/* --------------------------------------------------------------------- */}
      <section className="reveal-hidden py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto p-10 sm:p-16 rounded-3xl bg-zinc-900 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to host your next event?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Create your event page today. Set up in less than 2 minutes and welcome your guests with zero stress.
            </p>
          </div>

          <div className="pt-2 max-w-md mx-auto">
            <form
              onSubmit={handleStartWithEmail}
              className="flex items-center p-1.5 bg-zinc-800 rounded-full transition-all focus-within:ring-2 focus-within:ring-white/20"
            >
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email..."
                aria-label="Enter your email to create an event"
                className="flex-1 px-5 py-2.5 text-sm text-white placeholder:text-zinc-500 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="h-10 px-6 rounded-full bg-white text-zinc-950 text-xs font-semibold shrink-0 cursor-pointer hover:bg-zinc-100 transition-colors"
              >
                Create Event Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 10. MINIMAL FOOTER                                                    */}
      {/* --------------------------------------------------------------------- */}
      <footer className="border-t border-zinc-200/50 bg-[#fcfcfb] py-12 px-6 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Ticket className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-zinc-900">TicketPlatform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 font-medium">
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Sign In
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

        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-zinc-200/40 text-center sm:text-left text-[11px] text-zinc-400 flex flex-col sm:flex-row justify-between gap-2">
          <p>© 2026 TicketPlatform. All rights reserved.</p>
          <p>Simple, reliable event ticketing for independent hosts and organizations.</p>
        </div>
      </footer>
    </div>
  );
}
