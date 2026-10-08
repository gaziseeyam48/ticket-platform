import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters").max(255),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(100).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  event_type: z.enum(["FREE", "PAID"]),
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  location: z.string().max(500).optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const updateEventStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "LIVE", "ENDED", "CANCELLED"]),
});
