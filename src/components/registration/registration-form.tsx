"use client";

import { useState } from "react";
import { FormField } from "@/lib/validations/form";
import { submitRegistration, submitPaymentTransaction } from "@/app/actions/registration.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface RegistrationFormProps {
  event: {
    id: string;
    name: string;
    slug: string;
    event_type: "FREE" | "PAID";
    payment_config?: {
      payment_method?: string;
      account_number?: string;
      account_name?: string;
      amount?: string;
      currency?: string;
      instructions?: string;
    } | null;
  };
  fields: FormField[];
}

export function RegistrationForm({ event, fields }: RegistrationFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  // Post-registration states
  const [registrationResult, setRegistrationResult] = useState<{
    registrationId: string;
    eventType: "FREE" | "PAID";
    participantName: string;
    email: string;
    paymentConfig?: any;
    ticket?: {
      ticketNumber: string;
      ticketUrl: string;
      qrCodeDataUrl: string;
    } | null;
  } | null>(null);

  // Paid event transaction ID submission
  const [transactionId, setTransactionId] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSubmittedSuccess, setPaymentSubmittedSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear specific error on change
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneralError("");
    setFieldErrors({});

    try {
      const result = await submitRegistration(event.slug, formData, honeypot);
      setRegistrationResult({
        registrationId: result.registrationId,
        eventType: result.eventType,
        participantName: result.participantName,
        email: result.email,
        paymentConfig: result.paymentConfig,
        ticket: result.ticket,
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "details" in err) {
        const details = (err as { details?: Record<string, string> }).details;
        if (details && typeof details === "object") {
          setFieldErrors(details);
        }
      }
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationResult?.registrationId || !transactionId.trim()) return;

    setIsSubmittingPayment(true);
    setPaymentError("");

    try {
      await submitPaymentTransaction(registrationResult.registrationId, transactionId);
      setPaymentSubmittedSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit transaction details.";
      setPaymentError(message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // SUCCESS VIEW: Free Event (with issued ticket & QR code)
  if (registrationResult && registrationResult.eventType === "FREE") {
    const ticket = registrationResult.ticket;

    return (
      <Card className="bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-indigo-500" />
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-100">Ticket Issued Successfully!</h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm">
              Thank you, <span className="text-zinc-200 font-semibold">{registrationResult.participantName}</span>.
              Your official ticket for <span className="text-zinc-200 font-medium">{event.name}</span> is active and ready.
            </p>
          </div>

          {ticket && (
            <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-4 max-w-sm mx-auto shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs text-zinc-400">Digital Pass</span>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {ticket.ticketNumber}
                </span>
              </div>

              {/* QR Code Presentation */}
              <div className="p-3 bg-white rounded-xl inline-block shadow-md">
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR code for ticket ${ticket.ticketNumber}`}
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                Present this QR code at the event entrance for verification.
              </p>

              <a
                href={ticket.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full pt-1"
              >
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-10 shadow-lg shadow-indigo-600/20">
                  Open Digital Ticket View
                </Button>
              </a>
            </div>
          )}

          <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-left space-y-2 max-w-sm mx-auto text-xs text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-500">Attendee:</span>
              <span className="text-zinc-200 font-medium">{registrationResult.participantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Delivered to:</span>
              <span className="text-zinc-200 font-medium">{registrationResult.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="text-emerald-400 font-semibold uppercase">ACTIVE (ISSUED)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // SUCCESS VIEW: Paid Event (Instructions + Transaction Submission)
  if (registrationResult && registrationResult.eventType === "PAID") {
    const config = registrationResult.paymentConfig || event.payment_config || {};

    return (
      <Card className="bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="h-2 bg-gradient-to-r from-amber-500 to-indigo-500" />
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <CreditCard className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-zinc-100">Complete Your Payment</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Your registration is reserved! Follow the instructions below to finalize your ticket.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Instructions Details Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3.5">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-400" />
              Organizer Payment Information
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-zinc-500">Payment Method</p>
                <p className="text-zinc-200 font-medium mt-0.5">{config.payment_method || "Manual Transfer"}</p>
              </div>
              <div>
                <p className="text-zinc-500">Amount Due</p>
                <p className="text-emerald-400 font-bold mt-0.5 flex items-center">
                  <DollarSign className="h-3 w-3 inline" />
                  {config.amount || "0.00"} {config.currency || "USD"}
                </p>
              </div>
              {config.account_name && (
                <div>
                  <p className="text-zinc-500">Account Name</p>
                  <p className="text-zinc-200 font-medium mt-0.5">{config.account_name}</p>
                </div>
              )}
              {config.account_number && (
                <div>
                  <p className="text-zinc-500">Account / Number</p>
                  <p className="text-zinc-200 font-mono font-medium mt-0.5">{config.account_number}</p>
                </div>
              )}
            </div>

            {config.instructions && (
              <div className="pt-2 border-t border-zinc-900 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Instructions: </span>
                {config.instructions}
              </div>
            )}
          </div>

          {/* Transaction ID Submission Form */}
          {paymentSubmittedSuccess ? (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-semibold text-emerald-300">Payment Submitted for Review</h4>
              <p className="text-xs text-zinc-400">
                Your transaction ID has been recorded. Once the event organizer verifies the payment, your ticket will be activated and sent to your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {paymentError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {paymentError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Enter Transaction ID / Reference <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-984375928 or Bank Ref No."
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Please provide the exact reference or transaction ID from your payment slip.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingPayment || !transactionId.trim()}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium"
              >
                {isSubmittingPayment ? "Submitting Details..." : "Confirm & Submit Payment ID"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  // DEFAULT VIEW: Dynamic Registration Form
  return (
    <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-zinc-800/80 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {event.event_type} EVENT
          </span>
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Secure Registration
          </span>
        </div>
        <CardTitle className="text-2xl text-zinc-100 mt-2">{event.name}</CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Complete the form below to reserve your ticket.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot field (hidden from real users, catches bots) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Leave this field blank</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {generalError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Registration Notice</p>
                <p className="mt-0.5">{generalError}</p>
              </div>
            </div>
          )}

          {fields.map((field) => {
            const value = formData[field.id] ?? "";
            const error = fieldErrors[field.id];

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-200">
                  {field.label}{" "}
                  {field.required && <span className="text-rose-400">*</span>}
                </label>

                {/* Short text input */}
                {field.type === "text" && (
                  <Input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || "Enter text"}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`bg-zinc-950 border-zinc-800 text-zinc-100 ${
                      error ? "border-rose-500 focus:border-rose-500" : "focus:border-indigo-500"
                    }`}
                  />
                )}

                {/* Email input */}
                {field.type === "email" && (
                  <Input
                    type="email"
                    required={field.required}
                    placeholder={field.placeholder || "name@example.com"}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`bg-zinc-950 border-zinc-800 text-zinc-100 ${
                      error ? "border-rose-500 focus:border-rose-500" : "focus:border-indigo-500"
                    }`}
                  />
                )}

                {/* Phone input */}
                {field.type === "phone" && (
                  <Input
                    type="tel"
                    required={field.required}
                    placeholder={field.placeholder || "+1 (555) 000-0000"}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`bg-zinc-950 border-zinc-800 text-zinc-100 ${
                      error ? "border-rose-500 focus:border-rose-500" : "focus:border-indigo-500"
                    }`}
                  />
                )}

                {/* Number input */}
                {field.type === "number" && (
                  <Input
                    type="number"
                    required={field.required}
                    placeholder={field.placeholder || "0"}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`bg-zinc-950 border-zinc-800 text-zinc-100 ${
                      error ? "border-rose-500 focus:border-rose-500" : "focus:border-indigo-500"
                    }`}
                  />
                )}

                {/* Textarea */}
                {field.type === "textarea" && (
                  <textarea
                    rows={3}
                    required={field.required}
                    placeholder={field.placeholder || "Type here..."}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`w-full rounded-md border bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 ${
                      error
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  />
                )}

                {/* Dropdown Select */}
                {field.type === "dropdown" && (
                  <select
                    required={field.required}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={`w-full rounded-md border bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 ${
                      error
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">{field.placeholder || "Select an option..."}</option>
                    {(field.options || []).map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* Radio Options */}
                {field.type === "radio" && (
                  <div className="space-y-2 pt-1">
                    {(field.options || []).map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          checked={value === opt}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700"
                        />
                        <span className="text-sm text-zinc-200">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Single Checkbox */}
                {field.type === "checkbox" && (
                  <div className="pt-1">
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-800/40 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700 mt-0.5"
                      />
                      <span className="text-xs text-zinc-300">
                        {field.placeholder || "I agree to the terms and event guidelines."}
                      </span>
                    </label>
                  </div>
                )}

                {/* Field-level validation error */}
                {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
              </div>
            );
          })}

          <div className="pt-4 border-t border-zinc-800/80">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 text-base shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Registration...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Complete Registration <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <p className="text-center text-[11px] text-zinc-500 mt-2.5">
              By registering, you agree to receive event updates and ticket details.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
