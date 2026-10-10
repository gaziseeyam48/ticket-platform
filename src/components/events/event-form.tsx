"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvent, updateEvent } from "@/app/actions/event.actions";
import { createEventSchema } from "@/lib/validations/event";
import { CreditCard, Info } from "lucide-react";

interface EventFormProps {
  organizationId: string;
  eventId?: string;
  initialData?: any;
}

export function EventForm({ organizationId, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState<"FREE" | "PAID">(
    initialData?.event_type || "FREE"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGlobalError("");

    const formData = new FormData(e.currentTarget);
    const selectedType = (formData.get("event_type")?.toString() || "FREE") as "FREE" | "PAID";

    const rawData: any = {
      name: formData.get("name")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      event_type: selectedType,
      date_start: formData.get("date_start")?.toString() || "",
      date_end: formData.get("date_end")?.toString() || "",
      location: formData.get("location")?.toString() || "",
    };

    if (selectedType === "PAID") {
      rawData.payment_config = {
        payment_method: formData.get("payment_method")?.toString() || "",
        account_number: formData.get("account_number")?.toString() || "",
        account_name: formData.get("account_name")?.toString() || "",
        amount: formData.get("amount")?.toString() || "",
        currency: formData.get("currency")?.toString() || "USD",
        instructions: formData.get("instructions")?.toString() || "",
      };
    } else {
      rawData.payment_config = null;
    }

    const result = createEventSchema.safeParse(rawData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (eventId) {
        await updateEvent(eventId, formData);
        router.push(`/org/events/${eventId}`);
      } else {
        const event = await createEvent(organizationId, formData);
        router.push(`/org/events/${event.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setGlobalError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const initialPayment = initialData?.payment_config || {};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {globalError && (
        <div className="p-3 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-200">
          {globalError}
        </div>
      )}

      {/* Basic Event Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="name"
            name="name"
            label="Event Name"
            defaultValue={initialData?.name || ""}
            placeholder="e.g. Annual Design Summit"
            error={errors["name"]}
            required
          />
          <Input
            id="slug"
            name="slug"
            label="Event URL Slug"
            defaultValue={initialData?.slug || ""}
            placeholder="e.g. design-summit-2026"
            error={errors["slug"]}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-medium text-zinc-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description || ""}
            className="flex w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-transparent transition-colors shadow-2xs"
            placeholder="Brief summary of the gathering..."
          />
          {errors["description"] && (
            <p className="text-xs text-red-600 font-medium">{errors["description"]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="event_type" className="block text-xs font-medium text-zinc-700">
              Admission Model
            </label>
            <select
              id="event_type"
              name="event_type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as "FREE" | "PAID")}
              className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-transparent transition-colors shadow-2xs"
            >
              <option value="FREE">Free Admission</option>
              <option value="PAID">Paid Ticket (Manual Settlement)</option>
            </select>
            {errors["event_type"] && (
              <p className="text-xs text-red-600 font-medium">{errors["event_type"]}</p>
            )}
          </div>

          <Input
            id="location"
            name="location"
            label="Location (Optional)"
            defaultValue={initialData?.location || ""}
            placeholder="e.g. Metropolitan Hall or Virtual"
            error={errors["location"]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="date_start"
            name="date_start"
            type="datetime-local"
            label="Start Time (Optional)"
            defaultValue={initialData?.date_start ? formatDateForInput(initialData.date_start) : ""}
            error={errors["date_start"]}
          />
          <Input
            id="date_end"
            name="date_end"
            type="datetime-local"
            label="End Time (Optional)"
            defaultValue={initialData?.date_end ? formatDateForInput(initialData.date_end) : ""}
            error={errors["date_end"]}
          />
        </div>
      </div>

      {/* Paid Event Banking & Settlement Configuration */}
      {eventType === "PAID" && (
        <div className="pt-4 border-t border-zinc-200 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Payment & Banking Details
              </h3>
              <p className="text-xs text-zinc-500">
                These instructions will be displayed to attendees when submitting their registration.
              </p>
            </div>
          </div>

          {errors["payment_config"] && (
            <p className="text-xs text-red-600 font-medium">{errors["payment_config"]}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="payment_method" className="block text-xs font-medium text-zinc-700">
                Payment Channel / Method <span className="text-red-500">*</span>
              </label>
              <input
                id="payment_method"
                name="payment_method"
                defaultValue={initialPayment.payment_method || "bKash / Bank Transfer"}
                placeholder="e.g. bKash, Nagad, Wire"
                className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
                required
              />
              {errors["payment_config.payment_method"] && (
                <p className="text-xs text-red-600 font-medium">
                  {errors["payment_config.payment_method"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="amount" className="block text-xs font-medium text-zinc-700">
                Ticket Price / Fee <span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="text"
                defaultValue={initialPayment.amount || "500"}
                placeholder="e.g. 500"
                className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
                required
              />
              {errors["payment_config.amount"] && (
                <p className="text-xs text-red-600 font-medium">{errors["payment_config.amount"]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="currency" className="block text-xs font-medium text-zinc-700">
                Currency <span className="text-red-500">*</span>
              </label>
              <input
                id="currency"
                name="currency"
                defaultValue={initialPayment.currency || "BDT"}
                placeholder="e.g. BDT or USD"
                className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs uppercase"
                required
              />
              {errors["payment_config.currency"] && (
                <p className="text-xs text-red-600 font-medium">
                  {errors["payment_config.currency"]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="account_name" className="block text-xs font-medium text-zinc-700">
                Account Holder / Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                id="account_name"
                name="account_name"
                defaultValue={initialPayment.account_name || ""}
                placeholder="e.g. Acme Foundation"
                className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
                required
              />
              {errors["payment_config.account_name"] && (
                <p className="text-xs text-red-600 font-medium">
                  {errors["payment_config.account_name"]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="account_number" className="block text-xs font-medium text-zinc-700">
                Account / Wallet Number <span className="text-red-500">*</span>
              </label>
              <input
                id="account_number"
                name="account_number"
                defaultValue={initialPayment.account_number || ""}
                placeholder="e.g. 01700-000000 (Merchant/Personal)"
                className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
                required
              />
              {errors["payment_config.account_number"] && (
                <p className="text-xs text-red-600 font-medium">
                  {errors["payment_config.account_number"]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="instructions" className="block text-xs font-medium text-zinc-700">
              Step-by-Step Payment Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={3}
              defaultValue={
                initialPayment.instructions ||
                "Please send money via Send Money / Make Payment to the number above. Include your name in reference, and enter the Transaction ID (TrxID) below upon completion."
              }
              className="flex w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-colors shadow-2xs"
              placeholder="Instructions shown to attendees..."
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-start gap-2 text-xs text-zinc-600">
            <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              Attendees will receive these details immediately after submitting the registration form and will be prompted to enter their payment reference/transaction ID. You can approve or reject their submission from the event workspace.
            </span>
          </div>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading} className="font-semibold">
          {eventId ? "Save Changes" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
