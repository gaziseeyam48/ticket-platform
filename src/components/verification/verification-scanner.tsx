"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import { verifyEntrancePass } from "@/app/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { playScanSound, triggerHaptic } from "@/lib/utils/audio";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  QrCode,
  ShieldAlert,
  Camera,
  CameraOff,
  SwitchCamera,
  Keyboard,
  Flashlight,
  FlashlightOff,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";

type ScanResultState = {
  success: boolean;
  status: "VALID" | "ALREADY_CHECKED_IN" | "INVALID" | "REVOKED" | "EVENT_NOT_LIVE" | "WRONG_EVENT";
  message: string;
  eventName?: string;
  participantName?: string;
  participantEmail?: string;
  ticketNumber?: string;
  checkedInAt?: string;
} | null;

interface VerificationScannerProps {
  organizationName?: string;
  selectedEvent?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  availableEvents?: Array<{
    id: string;
    name: string;
  }>;
  verifierName?: string;
  isVerifierMode?: boolean;
}

export function VerificationScanner({
  selectedEvent,
  availableEvents,
  verifierName,
  isVerifierMode = false,
}: VerificationScannerProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResultState>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [recentScans, setRecentScans] = useState<
    Array<{
      id: string;
      name: string;
      ticketNumber: string;
      status: string;
      time: string;
    }>
  >([]);

  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network status for field operators
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedCode = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Focus hardware keyboard scanner input
  useEffect(() => {
    inputRef.current?.focus();
  }, [lastResult]);

  // Central verify function for both Camera QR and Hardware Barcode gun
  const processVerification = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim();
      if (!code || isVerifying) return;

      setIsVerifying(true);
      try {
        const result = await verifyEntrancePass(code, selectedEvent?.id);
        const typedResult = result as ScanResultState;
        setLastResult(typedResult);

        // Sound feedback
        if (soundEnabled && typedResult) {
          if (typedResult.status === "VALID") {
            playScanSound("VALID");
            triggerHaptic("VALID");
          } else if (typedResult.status === "ALREADY_CHECKED_IN") {
            playScanSound("ALREADY_CHECKED_IN");
            triggerHaptic("ALREADY_CHECKED_IN");
          } else {
            playScanSound("ERROR");
            triggerHaptic("ERROR");
          }
        }

        // Add to station log
        if (typedResult?.participantName || typedResult?.ticketNumber) {
          setRecentScans((prev) => [
            {
              id: `${Date.now()}`,
              name: typedResult.participantName || "Attendee",
              ticketNumber: typedResult.ticketNumber || "Pass",
              status: typedResult.status,
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
        if (soundEnabled) {
          playScanSound("ERROR");
          triggerHaptic("ERROR");
        }
      } finally {
        setIsVerifying(false);
      }
    },
    [isVerifying, selectedEvent?.id, soundEnabled]
  );

  // Manual Form Submission
  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    processVerification(tokenInput);
  };

  // Stop active camera stream
  const stopCameraStream = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  // Frame processing loop for QR code detection
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Match canvas dimensions to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Fast pure-JS QR code decoding
    const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (decoded && decoded.data) {
      const now = Date.now();
      const codeData = decoded.data.trim();

      // Debounce mechanism: prevent scanning identical pass code within 2 seconds
      if (codeData !== lastScannedCode.current || now - lastScannedTime.current > 2000) {
        lastScannedCode.current = codeData;
        lastScannedTime.current = now;
        processVerification(codeData);
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  }, [processVerification]);

  // Start Camera Stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera API is not supported in this browser environment.");
      setHasCameraPermission(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setHasCameraPermission(true);

      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track as any).getCapabilities?.() || {};
        if ("torch" in capabilities) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setHasCameraPermission(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Allow camera access to scan QR passes.");
      } else {
        setCameraError("Unable to access camera hardware. Use manual pass entry below.");
      }
    }
  }, [facingMode, scanFrame, stopCameraStream]);

  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  // Manage camera lifecycle
  useEffect(() => {
    if (isCameraActive && !lastResult) {
      startCameraStream();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isCameraActive, lastResult, startCameraStream, stopCameraStream]);

  const handleResetForNext = () => {
    setLastResult(null);
    setTokenInput("");
    lastScannedCode.current = null;
    inputRef.current?.focus();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans select-none">
      {/* Top Bar for Gate Operator */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between">
        {isVerifierMode ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs font-medium text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">
              Staff: {verifierName || "Authorized Verifier"}
            </span>
          </div>
        ) : (
          <Link
            href="/org"
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Gate</span>
          </Link>
        )}

        <div className="flex items-center gap-2 max-w-[200px] sm:max-w-xs truncate">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {selectedEvent ? selectedEvent.name : "Turnstile Gate"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isVerifierMode && availableEvents && availableEvents.length > 1 && (
            <Link
              href="/verify"
              className="text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 px-2 py-1 rounded-lg"
            >
              Switch Gate
            </Link>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
            aria-label={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-600 animate-in slide-in-from-top duration-200">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Device Offline. Active internet connection required for live check-in validation.</span>
        </div>
      )}

      {/* Main Verification Viewport */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-between space-y-4">
        {/* Verification Status Feedback (Prominent, High-Contrast) */}
        {lastResult ? (
          <div className="flex-1 flex flex-col justify-center">
            {/* 1. VALID PASS */}
            {lastResult.status === "VALID" && (
              <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                    Access Granted
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {lastResult.participantName}
                  </h2>
                  <p className="text-sm text-emerald-100 font-medium">{lastResult.eventName}</p>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 text-xs text-emerald-100 flex items-center justify-between">
                  <span className="font-mono">Pass: #{lastResult.ticketNumber}</span>
                  <span>{format(new Date(), "h:mm a")}</span>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm h-12 rounded-xl shadow-lg cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Next Attendee (Ready)
                </Button>
              </div>
            )}

            {/* 2. ALREADY CHECKED IN (DUPLICATE) */}
            {lastResult.status === "ALREADY_CHECKED_IN" && (
              <div className="p-6 rounded-3xl bg-amber-500 text-zinc-950 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-zinc-950" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-amber-950 font-bold">
                    Duplicate Entrance Scan
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">Already Checked In!</h2>
                  <p className="text-sm text-amber-950 font-medium">
                    Attendee: {lastResult.participantName || "Unknown"}
                  </p>
                </div>

                {lastResult.checkedInAt && (
                  <div className="p-3 rounded-2xl bg-black/10 text-xs text-amber-950">
                    Prior admittance: {format(new Date(lastResult.checkedInAt), "MMM d, h:mm a")}
                  </div>
                )}

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-sm h-12 rounded-xl shadow-lg cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Next Scan
                </Button>
              </div>
            )}

            {/* 3. WRONG EVENT */}
            {lastResult.status === "WRONG_EVENT" && (
              <div className="p-6 rounded-3xl bg-amber-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-amber-200 font-semibold">
                    Gate Mismatch
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">Wrong Event Pass</h2>
                  <p className="text-xs text-amber-100 max-w-xs mx-auto leading-relaxed">
                    {lastResult.message}
                  </p>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-amber-950 hover:bg-amber-50 font-bold text-sm h-12 rounded-xl shadow-lg cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Dismiss / Next Pass
                </Button>
              </div>
            )}

            {/* 4. INVALID OR REVOKED */}
            {(lastResult.status === "INVALID" || lastResult.status === "REVOKED") && (
              <div className="p-6 rounded-3xl bg-rose-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-rose-200 font-semibold">
                    Entrance Denied
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {lastResult.status === "REVOKED" ? "Pass Revoked" : "Invalid Ticket"}
                  </h2>
                  <p className="text-xs text-rose-100 max-w-xs mx-auto">{lastResult.message}</p>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-rose-950 hover:bg-rose-50 font-bold text-sm h-12 rounded-xl shadow-lg cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry / Next Pass
                </Button>
              </div>
            )}

            {/* 5. EVENT NOT LIVE */}
            {lastResult.status === "EVENT_NOT_LIVE" && (
              <div className="p-6 rounded-3xl bg-sky-600 text-white shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-white" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-sky-200 font-semibold">
                    Gate Inactive
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight">Event Not Live</h2>
                  <p className="text-xs text-sky-100 max-w-xs mx-auto">{lastResult.message}</p>
                </div>

                <Button
                  onClick={handleResetForNext}
                  className="w-full bg-white text-sky-950 hover:bg-sky-50 font-bold text-sm h-12 rounded-xl shadow-lg cursor-pointer"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Live Camera Viewport & Scan Target */
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden bg-zinc-900 border-2 border-zinc-800 shadow-2xl flex items-center justify-center">
              {/* Hidden frame extraction canvas */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Video feed */}
              {isCameraActive && hasCameraPermission !== false ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Animated Targeting Reticle Overlay */}
                  <div className="absolute inset-6 border border-white/20 rounded-2xl pointer-events-none">
                    {/* Reticle corner marks */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-sm" />

                    {/* Animated scanning beam */}
                    <div className="absolute inset-x-2 h-0.5 bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-bounce" />
                  </div>
                </>
              ) : (
                /* Fallback Graphic when Camera is Paused or Unavailable */
                <div className="p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <ScanLine className="h-7 w-7 text-emerald-400" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">
                    {cameraError ? "Camera Inactive" : "Camera Paused"}
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                    {cameraError || "Use barcode hardware scanner or click below to start camera."}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsCameraActive(true);
                      startCameraStream();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-8 px-3 rounded-lg cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    Enable Camera
                  </Button>
                </div>
              )}
            </div>

            {/* Camera Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsCameraActive(!isCameraActive)}
                className="px-3.5 py-2 min-h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="h-4 w-4 text-zinc-400" />
                    Pause Video
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 text-emerald-400" />
                    Start Video
                  </>
                )}
              </button>

              {isCameraActive && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="px-3.5 py-2 min-h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Flip front/rear camera"
                  aria-label="Flip front/rear camera"
                >
                  <SwitchCamera className="h-4 w-4 text-zinc-400" />
                  Flip Camera
                </button>
              )}

              {isCameraActive && torchSupported && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={cn(
                    "px-3.5 py-2 min-h-[44px] rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer",
                    torchOn
                      ? "bg-amber-400 text-zinc-950 border-amber-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                  )}
                  title={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
                  aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
                >
                  {torchOn ? (
                    <FlashlightOff className="h-4 w-4 text-zinc-950" />
                  ) : (
                    <Flashlight className="h-4 w-4 text-amber-400" />
                  )}
                  <span>{torchOn ? "Flashlight On" : "Flashlight"}</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 max-w-xs">
              Align attendee ticket QR code inside the viewfinder or scan via handheld laser.
            </p>
          </div>
        )}

        {/* Input Form for Handheld Hardware Scanners & Manual Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Laser scan or paste ticket URL..."
              aria-label="Ticket pass token or URL"
              disabled={isVerifying}
              className="flex-1 h-12 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button
              type="submit"
              disabled={isVerifying || !tokenInput.trim()}
              className="h-12 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer"
            >
              {isVerifying ? "Verifying..." : "Admit"}
            </Button>
          </div>
        </form>

        {/* Recent Scans Station Log */}
        {recentScans.length > 0 && (
          <div className="pt-2 border-t border-zinc-900 space-y-1.5">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Station Log (Last Scans)
            </span>
            <div className="space-y-1">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        scan.status === "VALID" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-zinc-200 truncate font-medium">{scan.name}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                      #{scan.ticketNumber}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">{scan.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
