"use client";

import { useState, useRef, useEffect } from "react";
import { verifyEntrancePass } from "@/app/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Ticket,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type ScanResultState = {
  success: boolean;
  status: "VALID" | "ALREADY_CHECKED_IN" | "INVALID" | "REVOKED" | "EVENT_NOT_LIVE";
  message: string;
  eventName?: string;
  participantName?: string;
  participantEmail?: string;
  ticketNumber?: string;
  checkedInAt?: string;
} | null;

interface VerificationScannerProps {
  organizationName?: string;
}

export function VerificationScanner({ organizationName }: VerificationScannerProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResultState>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState<Array<{
    id: string;
    name: string;
    ticketNumber: string;
    status: string;
    time: string;
  }>>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on scan input for rapid hardware barcode scanning
    inputRef.current?.focus();
  }, [lastResult]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = tokenInput.trim();
    if (!raw) return;

    setIsVerifying(true);
    try {
      const result = await verifyEntrancePass(raw);
      setLastResult(result as ScanResultState);

      if (result.participantName) {
        setRecentScans((prev) => [
          {
            id: `${Date.now()}`,
            name: result.participantName || "Attendee",
            ticketNumber: result.ticketNumber || "Pass",
            status: result.status,
            time: format(new Date(), "h:mm:ss a"),
          },
          ...prev.slice(0, 4),
        ]);
      }

      setTokenInput("");
    } catch {
      setLastResult({
        success: false,
        status: "INVALID",
        message: "Network or server connection failed. Please retry.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetForNext = () => {
    setLastResult(null);
    setTokenInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none">
      {/* Top Bar for Gate Operator */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between">
        <Link
          href="/org"
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Gate</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Entrance Turnstile Gate
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </header>

      {/* Main Verification Viewport */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-between space-y-4">
        {/* Verification Status Feedback (Prominent, High-Contrast) */}
        {lastResult ? (
          <div className="flex-1 flex flex-col justify-center">
            {lastResult.status === "VALID" && (
              <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-200 font-semibold">
                    Access Granted
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {lastResult.participantName}
                  </h2>
                  <p className="text-sm text-emerald-100 font-medium">
                    {lastResult.eventName}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 font-mono text-xs text-emerald-100 flex items-center justify-between">
                  <span>Pass: {lastResult.ticketNumber}</span>
                  <span>{format(new Date(), "h:mm a")}</span>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm h-12 rounded-xl shadow-lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Next Attendee (Ready)
                </Button>
              </div>
            )}

            {lastResult.status === "ALREADY_CHECKED_IN" && (
              <div className="p-6 rounded-3xl bg-amber-500 text-zinc-950 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-zinc-950" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-950 font-bold">
                    Duplicate Entrance Scan
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Already Checked In!
                  </h2>
                  <p className="text-sm text-amber-950 font-medium">
                    Attendee: {lastResult.participantName || "Unknown"}
                  </p>
                </div>

                {lastResult.checkedInAt && (
                  <div className="p-3 rounded-2xl bg-black/10 font-mono text-xs text-amber-950">
                    Prior scan: {format(new Date(lastResult.checkedInAt), "MMM d, h:mm a")}
                  </div>
                )}

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-sm h-12 rounded-xl shadow-lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Next Scan
                </Button>
              </div>
            )}

            {(lastResult.status === "INVALID" || lastResult.status === "REVOKED") && (
              <div className="p-6 rounded-3xl bg-rose-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-rose-200 font-semibold">
                    Entrance Denied
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {lastResult.status === "REVOKED" ? "Pass Revoked" : "Invalid Ticket"}
                  </h2>
                  <p className="text-xs text-rose-100 max-w-xs mx-auto">
                    {lastResult.message}
                  </p>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-rose-950 hover:bg-rose-50 font-bold text-sm h-12 rounded-xl shadow-lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry / Next Pass
                </Button>
              </div>
            )}

            {lastResult.status === "EVENT_NOT_LIVE" && (
              <div className="p-6 rounded-3xl bg-sky-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-200 font-semibold">
                    Gate Inactive
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Event Not Live
                  </h2>
                  <p className="text-xs text-sky-100 max-w-xs mx-auto">
                    {lastResult.message}
                  </p>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-sky-950 hover:bg-sky-50 font-bold text-sm h-12 rounded-xl shadow-lg"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Scan Target Graphic & Hardware Input */
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
            <div className="relative w-56 h-56 rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <ScanLine className="h-6 w-6 animate-pulse text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-zinc-300">
                Scan Pass QR Code
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                Laser scanner autofocus active
              </p>

              {/* Reticle corner markers */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-sm" />
            </div>

            <p className="text-xs text-zinc-400 max-w-xs">
              Point hardware barcode gun or enter token string below.
            </p>
          </div>
        )}

        {/* Input Form for Scanners / Manual Entry */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token or scan QR URL..."
              disabled={isVerifying}
              className="flex-1 h-12 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button
              type="submit"
              disabled={isVerifying || !tokenInput.trim()}
              className="h-12 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shrink-0"
            >
              {isVerifying ? "Verifying..." : "Admit"}
            </Button>
          </div>
        </form>

        {/* Recent Scans Log */}
        {recentScans.length > 0 && (
          <div className="pt-2 border-t border-zinc-900 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Station Log (Last Scans)
            </span>
            <div className="space-y-1">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        scan.status === "VALID" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-zinc-200 truncate">{scan.name}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">{scan.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
