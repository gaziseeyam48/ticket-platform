"use client";

import { useState } from "react";
import { FormField, FieldType } from "@/lib/validations/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Plus,
  Trash2,
  Sliders,
  Type,
  Mail,
  Phone,
  Hash,
  ListFilter,
  CheckCircle2,
  CheckSquare,
  AlignLeft,
  AlertTriangle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

interface FieldConfigPanelProps {
  field: FormField | null;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onRemoveField: (id: string) => void;
  onOpenAddField: () => void;
}

const TYPE_ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  dropdown: ListFilter,
  radio: CheckCircle2,
  checkbox: CheckSquare,
  textarea: AlignLeft,
};

const TYPE_NAMES: Record<FieldType, string> = {
  text: "Short text",
  email: "Email address",
  phone: "Phone number",
  number: "Number",
  dropdown: "Dropdown menu",
  radio: "Radio choices",
  checkbox: "Consent checkbox",
  textarea: "Long text",
};

export function FieldConfigPanel({
  field,
  onUpdateField,
  onRemoveField,
  onOpenAddField,
}: FieldConfigPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // If no field is selected
  if (!field) {
    return (
      <section
        aria-label="Field settings"
        data-tour="field-config-panel"
        className="rounded-2xl border border-[#DCE1E8] bg-white p-8 shadow-2xs text-center flex flex-col items-center justify-center min-h-[420px] space-y-3"
      >
        <div className="h-12 w-12 rounded-2xl bg-[#F1F4F8] flex items-center justify-center text-[#667085]">
          <Sliders className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="max-w-xs space-y-1">
          <h2 className="text-base font-semibold text-[#171923]">
            No field selected
          </h2>
          <p className="text-sm text-[#525B6B] leading-relaxed">
            Select a field from the outline on the left to edit its label, placeholder, and settings, or add a new field.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenAddField}
          className="gap-1.5 text-xs font-semibold h-8 px-3 mt-2 shadow-2xs text-[#171923] border-[#DCE1E8]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add field
        </Button>
      </section>
    );
  }

  const Icon = TYPE_ICONS[field.type] || Type;
  const typeName = TYPE_NAMES[field.type] || field.type;

  // Options helpers for dropdown & radio
  const options = field.options || [];

  const handleAddOption = () => {
    const nextOptions = [...options, `Option ${options.length + 1}`];
    onUpdateField(field.id, { options: nextOptions });
  };

  const handleUpdateOption = (optIndex: number, val: string) => {
    const nextOptions = [...options];
    nextOptions[optIndex] = val;
    onUpdateField(field.id, { options: nextOptions });
  };

  const handleRemoveOption = (optIndex: number) => {
    if (options.length <= 1) return;
    const nextOptions = options.filter((_, i) => i !== optIndex);
    onUpdateField(field.id, { options: nextOptions });
  };

  return (
    <section
      aria-label={`Settings for ${field.label}`}
      data-tour="field-config-panel"
      className="rounded-2xl border border-[#DCE1E8] bg-white p-6 shadow-2xs space-y-6"
    >
      {/* Field Configuration Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#F1F4F8]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#1D4ED8] shrink-0">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#171923] tracking-tight">
                {field.label || "Untitled field"}
              </h2>
            </div>
            <p className="text-xs text-[#525B6B] mt-0.5">
              {typeName} configuration
            </p>
          </div>
        </div>

        {/* Delete custom field button */}
        {!field.isSystem && (
          <div>
            {!confirmDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-medium text-[#C2415D] hover:text-[#9F1239] hover:bg-[#FFF1F2] gap-1.5 h-8 px-2.5"
                aria-label="Remove field"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove field
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 bg-[#FFF1F2] p-1.5 rounded-lg border border-[#FECDD3]">
                <span className="text-xs text-[#9F1239] font-medium pl-1">
                  Confirm delete?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveField(field.id);
                    setConfirmDelete(false);
                  }}
                  className="text-xs bg-[#C2415D] text-white px-2.5 py-1 rounded-md font-semibold hover:bg-[#9F1239] transition-colors"
                >
                  Yes, remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-[#525B6B] px-2 py-1 hover:text-[#171923] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Field Notice Banner */}
      {field.isSystem && (
        <div className="p-3.5 rounded-xl bg-[#F1F4F8] border border-[#DCE1E8] flex items-start gap-2.5 text-xs text-[#525B6B]">
          <Lock className="h-4 w-4 text-[#525B6B] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-semibold text-[#171923] block text-sm">
              Required system field
            </span>
            <p className="text-[#525B6B] mt-0.5 leading-relaxed text-xs sm:text-[13px]">
              This field is essential for attendee identification and digital ticket pass delivery. You can customize the label and placeholder text, but it cannot be deleted or set to optional.
            </p>
          </div>
        </div>
      )}

      {/* 1. Basic settings section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#525B6B]">
          Basic settings
        </h3>

        {/* Field Label Input */}
        <div className="space-y-1.5">
          <label
            htmlFor={`field-label-${field.id}`}
            className="block text-sm font-medium text-[#171923]"
          >
            Field label <span className="text-[#C2415D]" aria-hidden="true">*</span>
          </label>
          <Input
            id={`field-label-${field.id}`}
            value={field.label}
            onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
            placeholder="e.g. Full Name"
            required
          />
          <p className="text-[13px] text-[#525B6B]">
            The question or label attendees see on the registration form.
          </p>
        </div>

        {/* Placeholder text (Not applicable to checkbox) */}
        {field.type !== "checkbox" && (
          <div className="space-y-1.5">
            <label
              htmlFor={`field-placeholder-${field.id}`}
              className="block text-sm font-medium text-[#171923]"
            >
              Placeholder text
            </label>
            <Input
              id={`field-placeholder-${field.id}`}
              value={field.placeholder || ""}
              onChange={(e) =>
                onUpdateField(field.id, { placeholder: e.target.value })
              }
              placeholder="e.g. Enter your response..."
            />
            <p className="text-[13px] text-[#525B6B]">
              Sample text shown inside the input box before the attendee types.
            </p>
          </div>
        )}

        {/* Required / Optional Toggle */}
        <div className="p-3.5 rounded-xl bg-[#F1F4F8] border border-[#DCE1E8] flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-sm font-semibold text-[#171923]">
              Required question
            </span>
            <p className="text-[13px] text-[#525B6B]">
              {field.isSystem
                ? "This field is required by the ticket delivery protocol."
                : "Attendees must complete this field to register."}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id={`required-toggle-${field.id}`}
              checked={field.required}
              disabled={field.isSystem}
              onChange={(e) =>
                onUpdateField(field.id, { required: e.target.checked })
              }
              className="sr-only peer"
              aria-label={`Make ${field.label} required`}
            />
            <div className="w-10 h-5 bg-[#DCE1E8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DCE1E8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#171923] disabled:opacity-50" />
          </label>
        </div>
      </div>

      {/* 2. Field-specific settings section */}
      {(field.type === "dropdown" || field.type === "radio") && (
        <div className="pt-4 border-t border-[#F1F4F8] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#525B6B]">
                Choices & Options
              </h3>
              <p className="text-[13px] text-[#525B6B] mt-0.5">
                Attendees will pick one from this list. At least one option is required.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="gap-1 text-xs font-semibold h-8 px-2.5 shadow-2xs text-[#171923] border-[#DCE1E8]"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Add choice
            </Button>
          </div>

          <div className="space-y-2">
            {options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <span className="text-xs text-[#667085] font-mono w-5 text-right shrink-0">
                  {optIdx + 1}.
                </span>
                <Input
                  value={opt}
                  onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                  placeholder={`Choice ${optIdx + 1}`}
                  className="text-sm h-10"
                  aria-label={`Choice ${optIdx + 1}`}
                />
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(optIdx)}
                    title="Remove choice"
                    aria-label={`Remove choice ${optIdx + 1}`}
                    className="p-2 rounded-md text-[#667085] hover:text-[#C2415D] hover:bg-[#FFF1F2] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consent Checkbox Statement */}
      {field.type === "checkbox" && (
        <div className="pt-4 border-t border-[#F1F4F8] space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#525B6B]">
            Consent statement
          </h3>
          <p className="text-[13px] text-[#525B6B]">
            The agreement or waiver statement attendees must acknowledge by checking the box.
          </p>
          <Input
            value={field.placeholder || ""}
            onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
            placeholder="I agree to the terms, conditions, and code of conduct."
            className="text-sm h-10"
            aria-label="Consent agreement statement"
          />
        </div>
      )}

      {/* Helpful context for other field types */}
      {field.type === "number" && (
        <div className="pt-4 border-t border-[#F1F4F8] text-xs sm:text-[13px] text-[#525B6B] flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#667085] shrink-0" aria-hidden="true" />
          <span>Restricts attendee response to valid numeric values.</span>
        </div>
      )}

      {field.type === "phone" && (
        <div className="pt-4 border-t border-[#F1F4F8] text-xs sm:text-[13px] text-[#525B6B] flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#667085] shrink-0" aria-hidden="true" />
          <span>Validates that attendees enter a valid contact phone number with country code.</span>
        </div>
      )}

      {field.type === "textarea" && (
        <div className="pt-4 border-t border-[#F1F4F8] text-xs sm:text-[13px] text-[#525B6B] flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#667085] shrink-0" aria-hidden="true" />
          <span>Renders a multiline input suitable for longer notes, biographies, or special needs.</span>
        </div>
      )}
    </section>
  );
}
