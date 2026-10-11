"use client";

import { FormField, FieldType } from "@/lib/validations/form";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Lock,
  Type,
  Mail,
  Phone,
  Hash,
  ListFilter,
  CheckCircle2,
  CheckSquare,
  AlignLeft,
  Sliders,
  type LucideIcon,
} from "lucide-react";

interface FormOutlineProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onMoveField: (index: number, direction: "up" | "down") => void;
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
  email: "Email",
  phone: "Phone",
  number: "Number",
  dropdown: "Dropdown",
  radio: "Radio choices",
  checkbox: "Consent checkbox",
  textarea: "Long text",
};

export function FormOutline({
  fields,
  selectedFieldId,
  onSelectField,
  onMoveField,
  onRemoveField,
  onOpenAddField,
}: FormOutlineProps) {
  const customFieldsCount = fields.filter((f) => !f.isSystem).length;

  return (
    <section
      aria-label="Form outline"
      className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-2xs space-y-4 flex flex-col h-full"
    >
      {/* Header with Title and Add Field action */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
            Form outline
          </h2>
          <p className="text-[11px] text-zinc-500">
            {fields.length} {fields.length === 1 ? "field" : "fields"} in sequence
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onOpenAddField}
          className="gap-1.5 text-xs h-8 px-2.5 font-semibold"
          aria-label="Add a new field to form"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add field
        </Button>
      </div>

      {/* Ordered List of Fields */}
      <div
        role="list"
        aria-label="Ordered list of fields"
        className="space-y-1.5 flex-1 overflow-y-auto pr-0.5"
      >
        {fields.map((field, index) => {
          const isSelected = selectedFieldId === field.id;
          const isFirst = index === 0;
          const isLast = index === fields.length - 1;
          const Icon = TYPE_ICONS[field.type] || Type;
          const typeName = TYPE_NAMES[field.type] || field.type;

          return (
            <div
              key={field.id}
              role="listitem"
              className={`group relative rounded-xl border transition-all text-left flex items-center justify-between gap-2 p-2.5 ${
                isSelected
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                  : "bg-white text-zinc-900 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/80"
              }`}
            >
              {/* Field Main Clickable Region */}
              <button
                type="button"
                onClick={() => onSelectField(field.id)}
                aria-selected={isSelected}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-zinc-900 rounded-lg p-1"
              >
                {/* Order Index and Type Icon */}
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isSelected
                      ? "bg-zinc-800 text-white"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Field Label and Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? "text-white" : "text-zinc-900"
                      }`}
                      title={field.label}
                    >
                      {field.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                    <span
                      className={isSelected ? "text-zinc-300" : "text-zinc-500"}
                    >
                      {typeName}
                    </span>

                    <span
                      className={`inline-block h-1 w-1 rounded-full ${
                        isSelected ? "bg-zinc-600" : "bg-zinc-300"
                      }`}
                      aria-hidden="true"
                    />

                    {field.isSystem ? (
                      <span
                        className={`text-[10px] font-semibold flex items-center gap-1 ${
                          isSelected ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      >
                        <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                        System required
                      </span>
                    ) : field.required ? (
                      <span
                        className={
                          isSelected ? "text-red-300 font-medium" : "text-red-600 font-medium"
                        }
                      >
                        Required
                      </span>
                    ) : (
                      <span
                        className={isSelected ? "text-zinc-400" : "text-zinc-400"}
                      >
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Accessible Reorder and Action Controls */}
              <div
                className="flex items-center gap-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Move Up */}
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => onMoveField(index, "up")}
                  aria-label={`Move ${field.label} up`}
                  title={`Move ${field.label} up`}
                  className={`p-1.5 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed ${
                    isSelected
                      ? "text-zinc-300 hover:text-white hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => onMoveField(index, "down")}
                  aria-label={`Move ${field.label} down`}
                  title={`Move ${field.label} down`}
                  className={`p-1.5 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed ${
                    isSelected
                      ? "text-zinc-300 hover:text-white hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {/* Delete Button (Only for custom fields) */}
                {!field.isSystem && (
                  <button
                    type="button"
                    onClick={() => onRemoveField(field.id)}
                    aria-label={`Delete ${field.label} field`}
                    title={`Delete ${field.label} field`}
                    className={`p-1.5 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? "text-red-300 hover:text-red-100 hover:bg-red-950/40"
                        : "text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State / Tip when no custom fields exist */}
      {customFieldsCount === 0 && (
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-500 space-y-2 mt-auto">
          <p className="leading-relaxed">
            Only name and email are currently collected. Add custom questions like phone number, dietary needs, or company name.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAddField}
            className="w-full text-xs h-8 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add custom field
          </Button>
        </div>
      )}
    </section>
  );
}
