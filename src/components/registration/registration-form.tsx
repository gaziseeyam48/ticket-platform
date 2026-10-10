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

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
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
      const response = await submitRegistration(event.slug, formData, honeypot);

      setRegistrationResult({
        registrationId: response.registrationId!,
        eventType: response.eventType!,
        participantName: response.participantName!,
        email: response.email!,
        paymentConfig: response.paymentConfig,
        ticket: response.ticket,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected registration error.";
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationResult || !transactionId.trim()) return;

    setIsSubmittingPayment(true);
    try {
      const response = await submitPaymentTransaction(
        registrationResult.registrationId,
        transactionId.trim()
      );

      if (response.success) {
        setPaymentSubmittedSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit transaction details.";
      setGeneralError(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // SUCCESS VIEW: Free Event (Instant Ticket Issuance)
  if (registrationResult && registrationResult.eventType === "FREE") {
    const ticket = registrationResult.ticket;

    return (
      <Card className="border-zinc-200 bg-white shadow-xs text-center p-8 space-y-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-900">Registration Confirmed!</h2>
          <p className="text-xs text-zinc-500">
            Your pass for <span className="font-semibold text-zinc-800">{event.name}</span> has been issued.
          </p>
        </div>

        {ticket && (
          <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200 text-center space-y-4 max-w-sm mx-auto">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Digital Entrance Pass
            </span>

            {ticket.qrCodeDataUrl && (
              <div className="p-3 bg-white border border-zinc-200 rounded-xl inline-block shadow-2xs">
                <img
                  src={ticket.qrCodeDataUrl}
                  alt="Ticket QR"
                  className="w-40 h-40 object-contain mx-auto"
                />
              </div>
            )}

            <p className="font-mono text-sm font-bold text-zinc-900">
              #{ticket.ticketNumber}
            </p>

            <p className="text-xs text-zinc-500">
              A copy of your pass and secure access link has been dispatched to{" "}
              <span className="font-semibold text-zinc-800">{registrationResult.email}</span>.
            </p>

            <a
              href={ticket.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full pt-1"
            >
              <Button size="sm" className="w-full font-semibold">
                Open Digital Pass
              </Button>
            </a>
          </div>
        )}

        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-left space-y-2 max-w-sm mx-auto text-xs text-zinc-600">
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Attendee:</span>
            <span className="text-zinc-900 font-semibold">{registrationResult.participantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Delivered to:</span>
            <span className="text-zinc-900 font-medium">{registrationResult.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 font-medium">Status:</span>
            <span className="text-emerald-700 font-semibold">Confirmed (Issued)</span>
          </div>
        </div>
      </Card>
    );
  }

  // SUCCESS VIEW: Paid Event (Instructions + Transaction Submission)
  if (registrationResult && registrationResult.eventType === "PAID") {
    const config = registrationResult.paymentConfig || event.payment_config || {};

    return (
      <Card className="border-zinc-200 bg-white shadow-xs p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
            <CreditCard className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Complete Payment</h2>
          <p className="text-xs text-zinc-500">
            Registration reserved! Follow payment instructions below to finalize your pass.
          </p>
        </div>

        {/* Payment Details Box */}
        <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-zinc-500" />
            Organizer Payment Information
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-zinc-400 font-mono uppercase text-[10px]">Method</p>
              <p className="text-zinc-800 font-medium mt-0.5">{config.payment_method || "Direct Transfer"}</p>
            </div>
            <div>
              <p className="text-zinc-400 font-mono uppercase text-[10px]">Amount Due</p>
              <p className="text-zinc-900 font-bold mt-0.5">
                {config.amount || "0.00"} {config.currency || "USD"}
              </p>
            </div>
            {config.account_name && (
              <div>
                <p className="text-zinc-400 font-mono uppercase text-[10px]">Account Name</p>
                <p className="text-zinc-800 font-medium mt-0.5">{config.account_name}</p>
              </div>
            )}
            {config.account_number && (
              <div>
                <p className="text-zinc-400 font-mono uppercase text-[10px]">Account / Identifier</p>
                <p className="text-zinc-800 font-mono font-medium mt-0.5">{config.account_number}</p>
              </div>
            )}
          </div>

          {config.instructions && (
            <div className="pt-2 border-t border-zinc-200 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-800">Instructions: </span>
              {config.instructions}
            </div>
          )}
        </div>

        {/* Transaction ID Submission Form */}
        {paymentSubmittedSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <p className="text-xs font-semibold text-emerald-800">Payment Identifier Received!</p>
            <p className="text-xs text-emerald-700">
              The organizer will verify your payment and dispatch your digital pass to{" "}
              <span className="font-medium">{registrationResult.email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="txId" className="block text-xs font-medium text-zinc-700">
                Payment Reference / Transaction ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-89234190 or Bank Ref No."
              />
              <p className="text-[11px] text-zinc-400">
                Enter the reference or transaction ID from your receipt.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmittingPayment || !transactionId.trim()}
              className="w-full font-semibold"
            >
              {isSubmittingPayment ? "Submitting..." : "Confirm & Submit Reference"}
            </Button>
          </form>
        )}
      </Card>
    );
  }

  // DEFAULT VIEW: Dynamic Registration Form
  return (
    <Card className="border-zinc-200 bg-white shadow-xs overflow-hidden">
      <CardHeader className="border-b border-zinc-100 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            {event.event_type === "FREE" ? "Free Admission" : "Paid Pass"}
          </span>
          <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
            Verified Pass
          </span>
        </div>
        <CardTitle className="text-lg font-bold text-zinc-900 mt-2">{event.name}</CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Complete the details below to receive your entrance pass.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{generalError}</p>
              </div>
            </div>
          )}

          {fields.map((field) => {
            const value = formData[field.id] ?? "";
            const error = fieldErrors[field.id];

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {/* Short text input */}
                {field.type === "text" && (
                  <Input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || "Enter text"}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    error={error}
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
                    error={error}
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
                    error={error}
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
                    error={error}
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
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-2xs"
                  />
                )}

                {/* Dropdown Select */}
                {field.type === "dropdown" && (
                  <select
                    required={field.required}
                    value={value as string}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-2xs"
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
                  <div className="space-y-1.5 pt-0.5">
                    {(field.options || []).map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-2.5 p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={field.id}
                          value={opt}
                          checked={value === opt}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="text-zinc-900 focus:ring-zinc-900"
                        />
                        <span className="text-xs text-zinc-800">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Single Checkbox */}
                {field.type === "checkbox" && (
                  <div className="pt-0.5">
                    <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                        className="rounded text-zinc-900 focus:ring-zinc-900 mt-0.5"
                      />
                      <span className="text-xs text-zinc-700">
                        {field.placeholder || "I agree to the terms and event guidelines."}
                      </span>
                    </label>
                  </div>
                )}

                {/* Field-level error */}
                {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
              </div>
            );
          })}

          <div className="pt-4 border-t border-zinc-100">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-semibold h-11"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Pass...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Reserve Entrance Pass <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <p className="text-center text-[11px] text-zinc-400 mt-2 font-mono">
              Zero passwords • Instant digital pass delivery
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
