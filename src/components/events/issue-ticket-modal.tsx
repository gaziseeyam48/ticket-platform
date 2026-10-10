"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issueManualTicket } from "@/app/actions/ticket.actions";
import {
  CheckCircle2,
  Ticket,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface IssueTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  onSuccess?: () => void;
}

export function IssueTicketModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  onSuccess,
}: IssueTicketModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Admission");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Issued ticket payload
  const [issuedResult, setIssuedResult] = useState<{
    ticketNumber: string;
    ticketId: string;
    ticketUrl: string;
    qrCodeDataUrl: string;
    emailSent: boolean;
    participantName: string;
    participantEmail: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter attendee full name (at least 2 characters).");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please provide a valid attendee email address.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await issueManualTicket({
        eventId,
        participantName: name.trim(),
        participantEmail: email.trim(),
        category,
        notes: notes.trim() || undefined,
      });

      setIssuedResult({
        ticketNumber: result.ticketNumber,
        ticketId: result.ticketId,
        ticketUrl: result.ticketUrl,
        qrCodeDataUrl: result.qrCodeDataUrl,
        emailSent: result.emailSent,
        participantName: result.participantName,
        participantEmail: result.participantEmail,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to issue pass. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTicketUrl = () => {
    if (!issuedResult?.ticketUrl) return;
    navigator.clipboard.writeText(issuedResult.ticketUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleIssueAnother = () => {
    setName("");
    setEmail("");
    setNotes("");
    setError("");
    setIssuedResult(null);
  };

  const handleFullClose = () => {
    setName("");
    setEmail("");
    setCategory("General Admission");
    setNotes("");
    setError("");
    setIssuedResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleFullClose}
      title={issuedResult ? "Entrance Pass Issued" : "Issue Direct Entrance Pass"}
      description={
        issuedResult
          ? `Entrance pass has been created for ${eventName}.`
          : `Directly issue an authentic, cryptographically verified ticket pass for ${eventName}.`
      }
      maxWidth="md"
    >
      {issuedResult ? (
        <div className="space-y-4 py-1">
          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-950">
                Entrance Pass Active & Verified
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Pass <span className="font-mono font-bold">#{issuedResult.ticketNumber}</span> has been issued to{" "}
                <span className="font-semibold">{issuedResult.participantName}</span>.
              </p>
            </div>
          </div>

          {/* Ticket QR & Details Preview Box */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-3">
            <div className="inline-block p-2 bg-white rounded-lg border border-zinc-200/80 shadow-2xs">
              <img
                src={issuedResult.qrCodeDataUrl}
                alt="Entrance QR"
                className="w-36 h-36 mx-auto object-contain"
              />
            </div>

            <div>
              <p className="font-mono text-sm font-bold text-zinc-900 tracking-tight">
                #{issuedResult.ticketNumber}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Category: <span className="font-semibold text-zinc-700">{category}</span>
              </p>
            </div>

            {/* Email Dispatch Status */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 pt-1">
              <Mail className="h-3.5 w-3.5 text-zinc-400" />
              <span>
                {issuedResult.emailSent
                  ? `Confirmation pass dispatched to ${issuedResult.participantEmail}`
                  : `Pass generated. Email dispatch scheduled for ${issuedResult.participantEmail}`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-1/2 text-xs font-semibold gap-1.5"
                onClick={handleCopyTicketUrl}
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copied Link
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    Copy Pass Link
                  </>
                )}
              </Button>

              <a
                href={issuedResult.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="w-1/2"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                  View Pass Page
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-1/2 text-xs font-semibold gap-1.5"
                onClick={handleIssueAnother}
              >
                <Plus className="h-3.5 w-3.5" />
                Issue Another
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-1/2 text-xs font-semibold"
                onClick={handleFullClose}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              id="participantName"
              label="Attendee Full Name"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />

            <Input
              id="participantEmail"
              type="email"
              label="Attendee Email Address"
              placeholder="e.g. eleanor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <div className="space-y-1.5">
              <label htmlFor="ticketCategory" className="block text-xs font-medium text-zinc-700">
                Pass Allocation / Category
              </label>
              <select
                id="ticketCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
              >
                <option value="General Admission">General Admission</option>
                <option value="VIP">VIP Guest</option>
                <option value="Speaker">Speaker / Panelist</option>
                <option value="Organizer / Staff">Staff / Operations</option>
                <option value="Sponsor">Sponsor / Partner</option>
                <option value="Media">Media / Press</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ticketNotes" className="block text-xs font-medium text-zinc-700">
                Internal Note (Optional)
              </label>
              <input
                id="ticketNotes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Issued on request of keynote speaker"
                disabled={isLoading}
                className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 text-xs text-zinc-600 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-zinc-900">Direct Issuance Pipeline</p>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                This pass generates a unique QR code and cryptographic token hash, registers the participant, and emails their ticket automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-medium"
              onClick={handleFullClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="text-xs font-semibold gap-1.5"
              isLoading={isLoading}
            >
              <Ticket className="h-3.5 w-3.5" />
              Issue & Send Pass
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
