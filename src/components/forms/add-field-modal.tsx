"use client";

import { Modal } from "@/components/ui/modal";
import { FieldType, FormField } from "@/lib/validations/form";
import {
  Type,
  Mail,
  Phone,
  Hash,
  ListFilter,
  CheckCircle2,
  CheckSquare,
  AlignLeft,
  Info,
  type LucideIcon,
} from "lucide-react";

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (type: FieldType) => void;
  existingFields: FormField[];
}

interface FieldTypeOption {
  type: FieldType;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "contact" | "details" | "consent";
}

const FIELD_OPTIONS: FieldTypeOption[] = [
  // Contact information
  {
    type: "text",
    label: "Short text",
    description: "Single-line text for titles, company, affiliations, or notes",
    icon: Type,
    group: "contact",
  },
  {
    type: "email",
    label: "Email",
    description: "Email address with automatic syntax verification",
    icon: Mail,
    group: "contact",
  },
  {
    type: "phone",
    label: "Phone",
    description: "Contact number with international format validation",
    icon: Phone,
    group: "contact",
  },
  // Additional details
  {
    type: "number",
    label: "Number",
    description: "Numeric input for age, group size, or quantities",
    icon: Hash,
    group: "details",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Single-choice selection from a dropdown menu",
    icon: ListFilter,
    group: "details",
  },
  {
    type: "radio",
    label: "Radio choices",
    description: "Single selection from visible radio button choices",
    icon: CheckCircle2,
    group: "details",
  },
  {
    type: "textarea",
    label: "Long text",
    description: "Multi-line text area for comments, bios, or requests",
    icon: AlignLeft,
    group: "details",
  },
  // Consent
  {
    type: "checkbox",
    label: "Consent checkbox",
    description: "Agreement checkbox for terms, privacy, or guidelines",
    icon: CheckSquare,
    group: "consent",
  },
];

export function AddFieldModal({
  isOpen,
  onClose,
  onAddField,
  existingFields,
}: AddFieldModalProps) {
  // Check if system fields already exist
  const hasSystemEmail = existingFields.some(
    (f) => f.type === "email" && f.isSystem
  );

  const contactOptions = FIELD_OPTIONS.filter((o) => o.group === "contact");
  const detailOptions = FIELD_OPTIONS.filter((o) => o.group === "details");
  const consentOptions = FIELD_OPTIONS.filter((o) => o.group === "consent");

  const handleSelect = (type: FieldType) => {
    onAddField(type);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a field"
      description="Choose what type of information to collect from attendees."
      maxWidth="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Contact information group */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
            Contact information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {contactOptions.map((opt) => {
              const Icon = opt.icon;
              const isDuplicateEmail = opt.type === "email" && hasSystemEmail;

              return (
                <button
                  key={opt.type}
                  type="button"
                  disabled={isDuplicateEmail}
                  onClick={() => handleSelect(opt.type)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 group ${
                    isDuplicateEmail
                      ? "bg-zinc-50 border-zinc-200/60 opacity-60 cursor-not-allowed"
                      : "bg-white border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/60 cursor-pointer shadow-2xs"
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                      {opt.label}
                      {isDuplicateEmail && (
                        <span className="text-[10px] text-zinc-500 font-normal">
                          (Already in form)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal mt-0.5">
                      {isDuplicateEmail
                        ? "The required system email field is already in your form."
                        : opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional details group */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
            Additional details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detailOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelect(opt.type)}
                  className="p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/60 text-left transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900">
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent group */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
            Consent
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {consentOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelect(opt.type)}
                  className="p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/60 text-left transition-all flex items-start gap-3 group cursor-pointer shadow-2xs"
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900">
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Helper footer note */}
        <div className="pt-2 border-t border-zinc-100 flex items-center gap-2 text-[11px] text-zinc-500">
          <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span>
            Every field can be marked as required or optional after adding.
          </span>
        </div>
      </div>
    </Modal>
  );
}
