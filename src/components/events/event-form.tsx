"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvent, updateEvent } from "@/app/actions/event.actions";
import { z } from "zod";
import { createEventSchema } from "@/lib/validations/event";
import { format } from "date-fns";

type EventFormData = z.infer<typeof createEventSchema>;

interface EventFormProps {
  organizationId: string;
  eventId?: string;
  initialData?: any;
}

export function EventForm({ organizationId, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGlobalError("");

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name: formData.get("name")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      event_type: formData.get("event_type")?.toString() || "FREE",
      date_start: formData.get("date_start")?.toString() || "",
      date_end: formData.get("date_end")?.toString() || "",
      location: formData.get("location")?.toString() || "",
    };

    const result = createEventSchema.safeParse(rawData);

    if (!result.success) {
      const formattedErrors: any = {};
      result.error.issues.forEach((error: any) => {
        if (error.path[0]) {
          formattedErrors[error.path[0] as string] = error.message;
        }
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
      // Return YYYY-MM-DDTHH:mm format for datetime-local input
      return new Date(dateStr).toISOString().slice(0, 16);
    } catch (e) {
      return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {globalError && (
        <div className="p-3 text-sm font-medium rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="name"
          name="name"
          label="Event Name"
          defaultValue={initialData?.name || ""}
          placeholder="e.g. Annual Tech Conference"
          error={errors.name}
          required
        />
        <Input
          id="slug"
          name="slug"
          label="Event URL Slug"
          defaultValue={initialData?.slug || ""}
          placeholder="e.g. tech-conf-2027"
          error={errors.slug}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-xs font-medium text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialData?.description || ""}
          className="flex w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-colors"
          placeholder="Briefly describe your event..."
        />
        {errors.description && <p className="text-xs text-rose-400 font-medium">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="event_type" className="block text-xs font-medium text-zinc-300">
            Event Type
          </label>
          <select
            id="event_type"
            name="event_type"
            defaultValue={initialData?.event_type || "FREE"}
            className="flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-colors"
          >
            <option value="FREE">Free Event</option>
            <option value="PAID">Paid Event</option>
          </select>
          {errors.event_type && <p className="text-xs text-rose-400 font-medium">{errors.event_type}</p>}
        </div>
        
        <Input
          id="location"
          name="location"
          label="Location (Optional)"
          defaultValue={initialData?.location || ""}
          placeholder="e.g. San Francisco or Online"
          error={errors.location}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="date_start"
          name="date_start"
          type="datetime-local"
          label="Start Date (Optional)"
          defaultValue={initialData?.date_start ? formatDateForInput(initialData.date_start) : ""}
          error={errors.date_start}
        />
        <Input
          id="date_end"
          name="date_end"
          type="datetime-local"
          label="End Date (Optional)"
          defaultValue={initialData?.date_end ? formatDateForInput(initialData.date_end) : ""}
          error={errors.date_end}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {eventId ? "Save Changes" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
