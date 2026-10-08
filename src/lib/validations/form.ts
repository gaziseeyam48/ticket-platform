import { z } from "zod";

export const FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "number",
  "dropdown",
  "radio",
  "checkbox",
  "textarea",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const formFieldSchema = z.object({
  id: z.string().min(1, "Field ID is required"),
  type: z.enum(FIELD_TYPES),
  label: z.string().min(1, "Label is required").max(100, "Label cannot exceed 100 characters"),
  placeholder: z.string().max(200).optional().default(""),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1, "Option cannot be empty")).optional().default([]),
  order: z.number().int().min(0).default(0),
  isSystem: z.boolean().optional().default(false),
}).refine(
  (data) => {
    if (data.type === "dropdown" || data.type === "radio") {
      return Array.isArray(data.options) && data.options.length > 0;
    }
    return true;
  },
  {
    message: "Dropdown and radio fields must have at least one option",
    path: ["options"],
  }
);

export type FormField = z.infer<typeof formFieldSchema>;

export const registrationFormSchema = z.object({
  fields: z
    .array(formFieldSchema)
    .min(1, "Form must have at least one field")
    .refine(
      (fields) => {
        const ids = fields.map((f) => f.id);
        return new Set(ids).size === ids.length;
      },
      {
        message: "Field IDs must be unique",
      }
    )
    .refine(
      (fields) => {
        // Form must have at least one email field
        return fields.some((f) => f.type === "email");
      },
      {
        message: "Registration form must include an Email field",
      }
    )
    .refine(
      (fields) => {
        // Form must have at least one text or name field
        return fields.some((f) => f.id === "field_name" || (f.type === "text" && f.required));
      },
      {
        message: "Registration form must include a required Full Name field",
      }
    ),
});

export type RegistrationFormSchema = z.infer<typeof registrationFormSchema>;

export const DEFAULT_FORM_FIELDS: FormField[] = [
  {
    id: "field_name",
    type: "text",
    label: "Full Name",
    placeholder: "e.g. Jane Doe",
    required: true,
    options: [],
    order: 0,
    isSystem: true,
  },
  {
    id: "field_email",
    type: "email",
    label: "Email Address",
    placeholder: "e.g. jane@example.com",
    required: true,
    options: [],
    order: 1,
    isSystem: true,
  },
];

/**
 * Validates participant submission data against dynamic form field definitions.
 */
export function validateSubmissionData(fields: FormField[], submission: Record<string, any>) {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = submission[field.id];

    if (field.required) {
      if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }
    }

    if (value !== undefined && value !== null && value !== "") {
      switch (field.type) {
        case "email": {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value !== "string" || !emailRegex.test(value)) {
            errors[field.id] = "Please provide a valid email address";
          }
          break;
        }
        case "number": {
          if (isNaN(Number(value))) {
            errors[field.id] = "Please provide a valid number";
          }
          break;
        }
        case "phone": {
          const phoneRegex = /^[+0-9\s\-()]{6,25}$/;
          if (typeof value !== "string" || !phoneRegex.test(value)) {
            errors[field.id] = "Please provide a valid phone number";
          }
          break;
        }
        case "dropdown":
        case "radio": {
          if (field.options && !field.options.includes(value)) {
            errors[field.id] = `Selected value must be one of: ${field.options.join(", ")}`;
          }
          break;
        }
        case "checkbox": {
          if (field.required && value !== true && value !== "true") {
            errors[field.id] = `${field.label} must be checked`;
          }
          break;
        }
        default:
          break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
