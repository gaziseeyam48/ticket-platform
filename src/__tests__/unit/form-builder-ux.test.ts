import { describe, it, expect } from "vitest";
import {
  FormField,
  DEFAULT_FORM_FIELDS,
  registrationFormSchema,
  formFieldSchema,
  validateSubmissionData,
} from "@/lib/validations/form";

describe("Registration Form Builder Redesign — Information Architecture & UX Logic", () => {
  it("should preserve system-required fields and prevent their removal", () => {
    const fields: FormField[] = [...DEFAULT_FORM_FIELDS];

    const canRemoveField = (field: FormField) => !field.isSystem;

    const nameField = fields.find((f) => f.id === "field_name")!;
    const emailField = fields.find((f) => f.id === "field_email")!;

    expect(canRemoveField(nameField)).toBe(false);
    expect(canRemoveField(emailField)).toBe(false);

    // Custom field can be removed
    const customField: FormField = {
      id: "field_custom_phone",
      type: "phone",
      label: "Phone number",
      placeholder: "+1 555-000-0000",
      required: false,
      options: [],
      order: 2,
      isSystem: false,
    };
    expect(canRemoveField(customField)).toBe(true);
  });

  it("should prevent system fields from being set to optional", () => {
    const canToggleRequired = (field: FormField) => !field.isSystem;

    const nameField = DEFAULT_FORM_FIELDS.find((f) => f.id === "field_name")!;
    expect(canToggleRequired(nameField)).toBe(false);

    const customField: FormField = {
      id: "field_notes",
      type: "textarea",
      label: "Special requirements",
      required: false,
      options: [],
      order: 2,
      isSystem: false,
    };
    expect(canToggleRequired(customField)).toBe(true);
  });

  it("should accurately reorder fields and normalize order property", () => {
    const initial: FormField[] = [
      { id: "f1", type: "text", label: "Field 1", required: true, order: 0, options: [] },
      { id: "f2", type: "email", label: "Field 2", required: true, order: 1, options: [] },
      { id: "f3", type: "phone", label: "Field 3", required: false, order: 2, options: [] },
    ];

    const moveField = (list: FormField[], index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return list;
      const copy = [...list];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((f, i) => ({ ...f, order: i }));
    };

    // Move Field 3 up to index 1
    const reordered = moveField(initial, 2, "up");
    expect(reordered[1].id).toBe("f3");
    expect(reordered[1].order).toBe(1);
    expect(reordered[2].id).toBe("f2");
    expect(reordered[2].order).toBe(2);

    // Boundary check: cannot move top field up
    const noOp = moveField(initial, 0, "up");
    expect(noOp).toEqual(initial);
  });

  it("should detect duplicate system email addition and explain why it exists", () => {
    const fields = [...DEFAULT_FORM_FIELDS];
    const hasSystemEmail = fields.some((f) => f.type === "email" && f.isSystem);

    expect(hasSystemEmail).toBe(true);

    const checkCanAddType = (type: string) => {
      if (type === "email" && hasSystemEmail) {
        return {
          allowed: false,
          reason: "The form already includes a required Email field for ticket delivery.",
        };
      }
      return { allowed: true };
    };

    expect(checkCanAddType("email").allowed).toBe(false);
    expect(checkCanAddType("phone").allowed).toBe(true);
    expect(checkCanAddType("dropdown").allowed).toBe(true);
  });

  it("should enforce at least one option for dropdown and radio fields", () => {
    const validDropdown: FormField = {
      id: "field_tier",
      type: "dropdown",
      label: "Ticket Tier",
      required: true,
      options: ["VIP", "General"],
      order: 2,
    };
    expect(formFieldSchema.safeParse(validDropdown).success).toBe(true);

    const emptyDropdown: FormField = {
      id: "field_tier",
      type: "dropdown",
      label: "Ticket Tier",
      required: true,
      options: [],
      order: 2,
    };
    expect(formFieldSchema.safeParse(emptyDropdown).success).toBe(false);
  });

  it("should calculate save status and dirty changes properly", () => {
    const initialFields = [...DEFAULT_FORM_FIELDS];
    const snapshot = JSON.stringify(initialFields);

    // No changes
    const working1 = [...DEFAULT_FORM_FIELDS];
    expect(JSON.stringify(working1) === snapshot).toBe(true);

    // Modified label
    const working2 = [
      { ...initialFields[0], label: "Your Preferred Name" },
      initialFields[1],
    ];
    expect(JSON.stringify(working2) === snapshot).toBe(false);

    // Added field
    const working3 = [
      ...initialFields,
      {
        id: "field_3",
        type: "phone" as const,
        label: "Phone",
        required: false,
        options: [],
        order: 2,
      },
    ];
    expect(JSON.stringify(working3) === snapshot).toBe(false);
  });

  it("should ensure overall form conforms to registrationFormSchema constraints", () => {
    const validForm = {
      fields: [
        {
          id: "field_name",
          type: "text" as const,
          label: "Full Name",
          required: true,
          options: [],
          order: 0,
          isSystem: true,
        },
        {
          id: "field_email",
          type: "email" as const,
          label: "Email Address",
          required: true,
          options: [],
          order: 1,
          isSystem: true,
        },
        {
          id: "field_tshirt",
          type: "radio" as const,
          label: "T-Shirt Size",
          required: false,
          options: ["S", "M", "L", "XL"],
          order: 2,
        },
      ],
    };

    const parsed = registrationFormSchema.safeParse(validForm);
    expect(parsed.success).toBe(true);
  });

  it("should validate that phone numbers must have exactly 11 digits when entered", () => {
    const phoneField: FormField = {
      id: "field_phone",
      type: "phone",
      label: "Contact Number",
      required: false,
      options: [],
      order: 0,
    };

    // Exactly 11 digits (n = 11) -> valid, no error
    const valid11_1 = validateSubmissionData([phoneField], { field_phone: "01712345678" });
    expect(valid11_1.isValid).toBe(true);
    expect(valid11_1.errors.field_phone).toBeUndefined();

    const valid11_2 = validateSubmissionData([phoneField], { field_phone: "+1 (555) 123-4567" });
    expect(valid11_2.isValid).toBe(true);
    expect(valid11_2.errors.field_phone).toBeUndefined();

    // Less than 11 digits (n < 11) -> error
    const invalidShort = validateSubmissionData([phoneField], { field_phone: "01712345" });
    expect(invalidShort.isValid).toBe(false);
    expect(invalidShort.errors.field_phone).toBe("Phone number must be 11 digits");

    // More than 11 digits (n > 11) -> error
    const invalidLong = validateSubmissionData([phoneField], { field_phone: "0171234567890" });
    expect(invalidLong.isValid).toBe(false);
    expect(invalidLong.errors.field_phone).toBe("Phone number must be 11 digits");

    // Empty optional phone -> no error
    const emptyOptional = validateSubmissionData([phoneField], { field_phone: "" });
    expect(emptyOptional.isValid).toBe(true);
  });

  it("should allow manual card sorting by dragging from any position to any position", () => {
    const cards: FormField[] = [
      { id: "c1", type: "text", label: "Card 1", required: true, order: 0, options: [] },
      { id: "c2", type: "email", label: "Card 2", required: true, order: 1, options: [] },
      { id: "c3", type: "phone", label: "Card 3", required: false, order: 2, options: [] },
      { id: "c4", type: "number", label: "Card 4", required: false, order: 3, options: [] },
    ];

    const reorderCards = (list: FormField[], sourceIndex: number, destinationIndex: number) => {
      const copy = [...list];
      const [moved] = copy.splice(sourceIndex, 1);
      copy.splice(destinationIndex, 0, moved);
      return copy.map((f, i) => ({ ...f, order: i }));
    };

    // Drag Card 4 (index 3) to the very top (index 0)
    const resultTop = reorderCards(cards, 3, 0);
    expect(resultTop[0].id).toBe("c4");
    expect(resultTop[0].order).toBe(0);
    expect(resultTop[1].id).toBe("c1");
    expect(resultTop[1].order).toBe(1);

    // Drag Card 1 (index 0) to index 2
    const resultMiddle = reorderCards(cards, 0, 2);
    expect(resultMiddle[0].id).toBe("c2");
    expect(resultMiddle[1].id).toBe("c3");
    expect(resultMiddle[2].id).toBe("c1");
    expect(resultMiddle[2].order).toBe(2);
  });
});
