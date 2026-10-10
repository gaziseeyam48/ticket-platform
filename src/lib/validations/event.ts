import { z } from "zod";

export const paymentConfigSchema = z.object({
  payment_method: z.string().min(1, "Payment method is required"),
  account_number: z.string().min(1, "Account number is required"),
  account_name: z.string().min(1, "Account holder name is required"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  instructions: z.string().optional().default(""),
});

export type PaymentConfigData = z.infer<typeof paymentConfigSchema>;

export const createEventSchema = z
  .object({
    name: z.string().min(3, "Event name must be at least 3 characters").max(255),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(100)
      .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    event_type: z.enum(["FREE", "PAID"]),
    date_start: z.string().optional(),
    date_end: z.string().optional(),
    location: z.string().max(500).optional(),
    payment_config: paymentConfigSchema.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.event_type === "PAID") {
      if (!data.payment_config) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Payment configuration is required for paid events",
          path: ["payment_config"],
        });
      } else {
        if (!data.payment_config.payment_method?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Payment method is required for paid events",
            path: ["payment_config", "payment_method"],
          });
        }
        if (!data.payment_config.amount?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Amount is required for paid events",
            path: ["payment_config", "amount"],
          });
        }
        if (!data.payment_config.account_number?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Account number is required for paid events",
            path: ["payment_config", "account_number"],
          });
        }
      }
    }
  });

export const updateEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters").max(255).optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().optional(),
  event_type: z.enum(["FREE", "PAID"]).optional(),
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  location: z.string().max(500).optional(),
  payment_config: paymentConfigSchema.optional().nullable(),
});

export const updateEventStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "LIVE", "ENDED", "CANCELLED"]),
});

export type EventStatus = "DRAFT" | "PUBLISHED" | "LIVE" | "ENDED" | "CANCELLED";

export const VALID_EVENT_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["LIVE", "CANCELLED", "ENDED"],
  LIVE: ["ENDED", "CANCELLED"],
  ENDED: [],
  CANCELLED: [],
};

export function isValidStatusTransition(current: EventStatus, next: EventStatus): boolean {
  if (current === "ENDED" || current === "CANCELLED") return false;
  return VALID_EVENT_TRANSITIONS[current]?.includes(next) ?? false;
}

export function canTransitionEventStatus(current: EventStatus, next: EventStatus): boolean {
  return isValidStatusTransition(current, next);
}
