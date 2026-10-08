import { describe, it, expect } from "vitest";
import {
  registrationFormSchema,
  formFieldSchema,
  validateSubmissionData,
  FormField,
  DEFAULT_FORM_FIELDS,
} from "@/lib/validations/form";

describe("Phase 4: Registration Form Validation & Schema", () => {
  it("should validate default form fields correctly", () => {
    const result = registrationFormSchema.safeParse({
      fields: DEFAULT_FORM_FIELDS,
    });

    expect(result.success).toBe(true);
  });

  it("should require an email field in the form schema", () => {
    const invalidFields: FormField[] = [
      {
        id: "field_name",
        type: "text",
        label: "Full Name",
        required: true,
        options: [],
        order: 0,
      },
      {
        id: "field_phone",
        type: "phone",
        label: "Phone",
        required: false,
        options: [],
        order: 1,
      },
    ];

    const result = registrationFormSchema.safeParse({
      fields: invalidFields,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Email field");
    }
  });

  it("should enforce that dropdown and radio fields have at least one option", () => {
    const invalidField: FormField = {
      id: "field_dropdown",
      type: "dropdown",
      label: "Select Option",
      required: false,
      options: [], // empty options
      order: 2,
    };

    const result = formFieldSchema.safeParse(invalidField);
    expect(result.success).toBe(false);
  });

  it("should reject duplicate field IDs", () => {
    const duplicateFields: FormField[] = [
      {
        id: "field_duplicate",
        type: "text",
        label: "Name",
        required: true,
        options: [],
        order: 0,
      },
      {
        id: "field_duplicate",
        type: "email",
        label: "Email",
        required: true,
        options: [],
        order: 1,
      },
    ];

    const result = registrationFormSchema.safeParse({
      fields: duplicateFields,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("unique");
    }
  });

  it("should validate participant submissions against dynamic fields correctly", () => {
    const fields: FormField[] = [
      {
        id: "field_name",
        type: "text",
        label: "Full Name",
        required: true,
        options: [],
        order: 0,
      },
      {
        id: "field_email",
        type: "email",
        label: "Email Address",
        required: true,
        options: [],
        order: 1,
      },
      {
        id: "field_tshirt",
        type: "dropdown",
        label: "T-Shirt Size",
        required: false,
        options: ["S", "M", "L", "XL"],
        order: 2,
      },
      {
        id: "field_terms",
        type: "checkbox",
        label: "Agree to Guidelines",
        required: true,
        options: [],
        order: 3,
      },
    ];

    // Valid submission
    const validData = {
      field_name: "Jane Doe",
      field_email: "jane@example.com",
      field_tshirt: "M",
      field_terms: true,
    };
    const validValidation = validateSubmissionData(fields, validData);
    expect(validValidation.isValid).toBe(true);
    expect(Object.keys(validValidation.errors).length).toBe(0);

    // Missing required field & invalid email & invalid dropdown value
    const invalidData = {
      field_name: "", // Empty required
      field_email: "invalid-email-string",
      field_tshirt: "XXXL", // Not in options
      field_terms: false, // Required checkbox not checked
    };
    const invalidValidation = validateSubmissionData(fields, invalidData);
    expect(invalidValidation.isValid).toBe(false);
    expect(invalidValidation.errors.field_name).toBeDefined();
    expect(invalidValidation.errors.field_email).toBeDefined();
    expect(invalidValidation.errors.field_tshirt).toBeDefined();
    expect(invalidValidation.errors.field_terms).toBeDefined();
  });
});
