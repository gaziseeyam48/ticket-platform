"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvent, updateEvent } from "@/app/actions/event.actions";
import { z } from "zod";
import { createEventSchema } from "@/lib/validations/event";

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
      return new Date(dateStr).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {globalError && (
        <div className="p-3 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-200">
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="name"
          name="name"
          label="Event Name"
          defaultValue={initialData?.name || ""}
          placeholder="e.g. Annual Design Summit"
          error={errors.name}
          required
        />
        <Input
          id="slug"
          name="slug"
          label="Event URL Slug"
          defaultValue={initialData?.slug || ""}
          placeholder="e.g. design-summit-2026"
          error={errors.slug}
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
        {errors.description && <p className="text-xs text-red-600 font-medium">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="event_type" className="block text-xs font-medium text-zinc-700">
            Event Type
          </label>
          <select
            id="event_type"
            name="event_type"
            defaultValue={initialData?.event_type || "FREE"}
            className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:border-transparent transition-colors shadow-2xs"
          >
            <option value="FREE">Free Pass</option>
            <option value="PAID">Paid Ticket</option>
          </select>
          {errors.event_type && <p className="text-xs text-red-600 font-medium">{errors.event_type}</p>}
        </div>
        
        <Input
          id="location"
          name="location"
          label="Location (Optional)"
          defaultValue={initialData?.location || ""}
          placeholder="e.g. Metropolitan Hall or Virtual"
          error={errors.location}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="date_start"
          name="date_start"
          type="datetime-local"
          label="Start Time (Optional)"
          defaultValue={initialData?.date_start ? formatDateForInput(initialData.date_start) : ""}
          error={errors.date_start}
        />
        <Input
          id="date_end"
          name="date_end"
          type="datetime-local"
          label="End Time (Optional)"
          defaultValue={initialData?.date_end ? formatDateForInput(initialData.date_end) : ""}
          error={errors.date_end}
        />
      </div>

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
