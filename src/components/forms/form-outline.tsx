"use client";

import { useState } from "react";
import { FormField, FieldType } from "@/lib/validations/form";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Lock,
  GripVertical,
  Type,
  Mail,
  Phone,
  Hash,
  ListFilter,
  CheckCircle2,
  CheckSquare,
  AlignLeft,
  type LucideIcon,
} from "lucide-react";

interface FormOutlineProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
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
  onReorder,
  onRemoveField,
  onOpenAddField,
}: FormOutlineProps) {
  const customFieldsCount = fields.filter((f) => !f.isSystem).length;

  // Drag and drop sorting state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <section
      aria-label="Form outline"
      data-tour="form-outline"
      className="rounded-2xl border border-[#DCE1E8] bg-white p-4 shadow-2xs space-y-4 flex flex-col h-full"
    >
      {/* Header with Title and Add Field action */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
        <div>
          <h2 className="text-base font-semibold text-[#171923] tracking-tight">
            Form outline
          </h2>
          <p className="text-xs text-[#525B6B] mt-0.5">
            {fields.length} {fields.length === 1 ? "field" : "fields"} • Drag cards to reorder
          </p>
        </div>

        <Button
          type="button"
          data-tour="add-field-button"
          size="sm"
          onClick={onOpenAddField}
          className="gap-1.5 text-xs h-8 px-3 font-semibold shadow-xs"
          aria-label="Add a new field to form"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add field
        </Button>
      </div>

      {/* Ordered List of Draggable Cards */}
      <div
        role="list"
        aria-label="Ordered list of fields"
        className="space-y-2 flex-1 overflow-y-auto pr-0.5"
      >
        {fields.map((field, index) => {
          const isSelected = selectedFieldId === field.id;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;
          const Icon = TYPE_ICONS[field.type] || Type;
          const typeName = TYPE_NAMES[field.type] || field.type;

          return (
            <div
              key={field.id}
              role="listitem"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-xl border transition-all text-left flex items-center justify-between gap-1 p-2.5 select-none ${
                isDragging
                  ? "opacity-30 border-dashed border-[#9AA4B2] bg-[#F1F4F8] cursor-grabbing"
                  : isDragOver
                  ? "border-[#171923] ring-2 ring-[#171923]/20 bg-[#F1F4F8] -translate-y-0.5"
                  : isSelected
                  ? "bg-white text-[#171923] border-[#171923] ring-2 ring-[#171923]/10 shadow-xs"
                  : "bg-white text-[#171923] border-[#DCE1E8] hover:border-[#171923] hover:bg-[#F7F8FA]"
              }`}
            >
              {/* Hand Picker / Drag Handle */}
              <div
                className={`p-1.5 -ml-1 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors shrink-0 ${
                  isSelected
                    ? "text-[#525B6B] hover:text-[#171923] hover:bg-[#F1F4F8]"
                    : "text-[#9AA4B2] hover:text-[#525B6B] hover:bg-[#F1F4F8]"
                }`}
                title="Drag to sort card"
                aria-label="Drag to reorder card"
              >
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </div>

              {/* Field Clickable Selection Area */}
              <button
                type="button"
                onClick={() => onSelectField(field.id)}
                aria-selected={isSelected}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#171923] rounded-lg p-1"
              >
                {/* Type Icon */}
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isSelected
                      ? "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
                      : "bg-[#F1F4F8] text-[#525B6B] border border-[#DCE1E8]"
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Field Label and Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-semibold truncate text-[#171923]"
                      title={field.label}
                    >
                      {field.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="text-[#525B6B]">
                      {typeName}
                    </span>

                    <span
                      className="inline-block h-1 w-1 rounded-full bg-[#DCE1E8]"
                      aria-hidden="true"
                    />

                    {field.isSystem ? (
                      <span className="text-xs font-medium flex items-center gap-1 text-[#525B6B]">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        System required
                      </span>
                    ) : field.required ? (
                      <span className="text-[#C2415D] font-medium">
                        Required
                      </span>
                    ) : (
                      <span className="text-[#667085]">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Action: Delete custom field (No arrows!) */}
              <div
                className="flex items-center shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {!field.isSystem ? (
                  <button
                    type="button"
                    onClick={() => onRemoveField(field.id)}
                    aria-label={`Delete ${field.label} field`}
                    title={`Delete ${field.label} field`}
                    className="p-1.5 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center transition-colors cursor-pointer text-[#667085] hover:text-[#C2415D] hover:bg-[#FFF1F2]"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <div
                    className="p-1.5 text-[#9AA4B2] opacity-60"
                    title="System required field cannot be removed"
                  >
                    <Lock className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State / Tip when no custom fields exist */}
      {customFieldsCount === 0 && (
        <div className="p-3.5 rounded-xl bg-[#F1F4F8] border border-[#DCE1E8] text-xs text-[#525B6B] space-y-2 mt-auto">
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
