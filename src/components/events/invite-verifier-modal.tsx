"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteVerifier } from "@/app/actions/verifier.actions";
import { cn } from "@/lib/utils/cn";
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Mail,
  Clock,
  KeyRound,
} from "lucide-react";

interface InviteVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  onSuccess?: () => void;
}

const EXPIRATION_OPTIONS = [
  { label: "24 Hours (Event Day)", hours: 24 },
  { label: "3 Days (Recommended)", hours: 72 },
  { label: "7 Days (Multi-day)", hours: 168 },
];

export function InviteVerifierModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  onSuccess,
}: InviteVerifierModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const [result, setResult] = useState<{
    verifier: any;
    magicLink: string;
    emailSent: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter staff member's full name (at least 2 characters).");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await inviteVerifier({
        eventId,
        name: name.trim(),
        email: email.trim(),
        expiresInHours,
      });

      setResult({
        verifier: res.verifier,
        magicLink: res.magicLink,
        emailSent: res.emailSent,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to invite gate staff. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!result?.magicLink) return;
    navigator.clipboard.writeText(result.magicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setExpiresInHours(72);
    setError("");
    setResult(null);
    setCopiedLink(false);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={result ? "Gate Staff Invited" : "Delegate Gate Verifier"}
      description={
        result
          ? `Cryptographic single-click entrance access credentials generated for ${eventName}.`
          : `Grant temporary entrance scanner access to volunteer gate staff or security personnel.`
      }
      maxWidth="md"
    >
      {result ? (
        <div className="space-y-5 pt-1">
          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-950">
                Magic Link Ready & Dispatched
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Staff member <span className="font-semibold text-emerald-950">{name}</span> can now open the
                entrance verification station with zero login or password requirements.
              </p>
            </div>
          </div>

          {/* Email Status Indicator */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-700 font-medium truncate mr-2">
              <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="truncate">
                Invitation sent to <span className="font-mono text-zinc-900 font-semibold">{email}</span>
              </span>
            </div>
            {result.emailSent ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <Check className="h-3 w-3" /> Dispatched
              </span>
            ) : (
              <span className="text-amber-800 font-medium shrink-0 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Link Generated (Manual delivery)
              </span>
            )}
          </div>

          {/* Magic Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
              Direct Magic Access URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={result.magicLink}
                className="flex-1 h-10 px-3 rounded-lg bg-zinc-50 border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 select-all shadow-2xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCopyLink}
                className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-2xs cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-white" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Share this link securely via WhatsApp, SMS, or Slack. The link expires automatically
              in {expiresInHours} hours and restricts staff strictly to this event.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs font-medium text-zinc-700 border-zinc-200 hover:bg-zinc-100 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Invite Another Staff
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleModalClose}
              className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold px-4 h-9 rounded-lg cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              id="verifierName"
              label="Staff Member Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              disabled={isLoading}
              required
            />

            <div>
              <Input
                id="verifierEmail"
                type="email"
                label="Staff Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                disabled={isLoading}
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                The invitation magic link will be dispatched directly to this email address.
              </p>
            </div>
          </div>

          {/* Duration Window Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              Access Duration Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPIRATION_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setExpiresInHours(opt.hours)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer",
                    expiresInHours === opt.hours
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-2xs ring-1 ring-emerald-600"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security Sandbox Scope */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              Security Sandbox Scope
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Verifiers do not have account passwords or dashboard access. They can solely scan and
              verify entrance passes for <strong className="text-zinc-900 font-semibold">{eventName}</strong> during
              their active time window.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleModalClose}
              disabled={isLoading}
              className="text-xs font-medium text-zinc-700 border-zinc-200 hover:bg-zinc-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-2xs cursor-pointer"
            >
              {isLoading ? "Generating Link..." : "Create Magic Link & Invite"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
