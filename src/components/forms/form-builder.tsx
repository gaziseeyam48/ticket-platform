"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FormField, FieldType } from "@/lib/validations/form";
import { saveRegistrationForm } from "@/app/actions/form.actions";
import { FormBuilderHeader, SaveStatus } from "./form-builder-header";
import { FormOutline } from "./form-outline";
import { FieldConfigPanel } from "./field-config-panel";
import { FormPreview } from "./form-preview";
import { AddFieldModal } from "./add-field-modal";
import { ListOrdered, Sliders, Eye } from "lucide-react";

interface FormBuilderProps {
  eventId: string;
  initialFields: FormField[];
  eventName: string;
  eventSlug: string;
}

const DEFAULT_FIELD_TEMPLATES: Record<
  FieldType,
  { label: string; placeholder: string; options?: string[] }
> = {
  text: {
    label: "Short text",
    placeholder: "e.g. Company, job title, or university",
  },
  email: {
    label: "Email",
    placeholder: "attendee@example.com",
  },
  phone: {
    label: "Phone number",
    placeholder: "+1 (555) 000-0000",
  },
  number: {
    label: "Number",
    placeholder: "e.g. 25",
  },
  dropdown: {
    label: "Dropdown",
    placeholder: "Select an option...",
    options: ["Option 1", "Option 2"],
  },
  radio: {
    label: "Radio choices",
    placeholder: "",
    options: ["Option 1", "Option 2"],
  },
  checkbox: {
    label: "Consent checkbox",
    placeholder: "I agree to the attendee guidelines and code of conduct.",
  },
  textarea: {
    label: "Long text",
    placeholder: "Provide additional details or requests...",
  },
};

export function FormBuilder({
  eventId,
  initialFields,
  eventName,
  eventSlug,
}: FormBuilderProps) {
  // Working fields state
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [savedFieldsSnapshot, setSavedFieldsSnapshot] = useState<string>(
    JSON.stringify(initialFields)
  );

  // Selected field in outline
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialFields[0]?.id || null
  );

  // Save states
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  // Modals & responsive drawer states
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"outline" | "configure" | "preview">("outline");

  // Screen-reader live announcement
  const [announcement, setAnnouncement] = useState("");

  // Unsaved changes detector
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(fields) !== savedFieldsSnapshot;
  }, [fields, savedFieldsSnapshot]);

  // Window beforeunload guard to prevent accidental navigation loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // The currently selected field object
  const selectedField = useMemo(() => {
    return fields.find((f) => f.id === selectedFieldId) || null;
  }, [fields, selectedFieldId]);

  // Re-sync selectedFieldId if current selected field is removed
  useEffect(() => {
    if (selectedFieldId && !fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(fields[0]?.id || null);
    }
  }, [fields, selectedFieldId]);

  // 1. Select field handler (on mobile, switches tab to configure)
  const handleSelectField = useCallback((id: string) => {
    setSelectedFieldId(id);
    setMobileTab("configure");
  }, []);

  // 2. Add field handler
  const handleAddField = useCallback((type: FieldType) => {
    const template = DEFAULT_FIELD_TEMPLATES[type];
    const newId = `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newField: FormField = {
      id: newId,
      type,
      label: template.label,
      placeholder: template.placeholder,
      required: false,
      order: fields.length,
      options: template.options ? [...template.options] : [],
      isSystem: false,
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
    setMobileTab("configure");
    setAnnouncement(`Added ${template.label} field to form`);
  }, [fields.length]);

  // 3. Update field handler
  const handleUpdateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  // 4. Move field handler
  const handleMoveField = useCallback((index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    setFields((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((f, i) => ({ ...f, order: i }));
    });

    const targetField = fields[index];
    if (targetField) {
      setAnnouncement(`Moved ${targetField.label} ${direction}`);
    }
  }, [fields]);

  // 5. Remove field handler
  const handleRemoveField = useCallback((id: string) => {
    const target = fields.find((f) => f.id === id);
    if (!target || target.isSystem) return;

    setFields((prev) => prev.filter((f) => f.id !== id));
    setAnnouncement(`Removed ${target.label} field`);
  }, [fields]);

  // 6. Save changes handler
  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveErrorMessage("");

    try {
      await saveRegistrationForm(eventId, fields);
      setSavedFieldsSnapshot(JSON.stringify(fields));
      setSaveStatus("saved");
      setAnnouncement("Registration form saved successfully.");

      // Reset saved state back to idle after 4 seconds
      setTimeout(() => {
        setSaveStatus((current) => (current === "saved" ? "idle" : current));
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save registration form.";
      setSaveErrorMessage(msg);
      setSaveStatus("error");
      setAnnouncement(`Error saving form: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden screen-reader announcement region */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* A. Unified Page Header */}
      <FormBuilderHeader
        eventId={eventId}
        eventName={eventName}
        eventSlug={eventSlug}
        hasUnsavedChanges={hasUnsavedChanges}
        saveStatus={saveStatus}
        saveErrorMessage={saveErrorMessage}
        onSave={handleSave}
        onOpenPreview={() => setIsPreviewModalOpen(true)}
      />

      {/* Mobile / Tablet Tab Navigation Bar (< lg screens) */}
      <div className="lg:hidden">
        <nav
          aria-label="Form editor sections"
          className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200"
        >
          <button
            type="button"
            onClick={() => setMobileTab("outline")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === "outline"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            aria-selected={mobileTab === "outline"}
          >
            <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Fields ({fields.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("configure")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === "configure"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            aria-selected={mobileTab === "configure"}
          >
            <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Configure</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              mobileTab === "preview"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
            aria-selected={mobileTab === "preview"}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Preview</span>
          </button>
        </nav>
      </div>

      {/* B. Form Configuration Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. Left — Form outline */}
        <div
          className={`lg:col-span-3 lg:block ${
            mobileTab === "outline" ? "block" : "hidden"
          }`}
        >
          <FormOutline
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={handleSelectField}
            onMoveField={handleMoveField}
            onRemoveField={handleRemoveField}
            onOpenAddField={() => setIsAddFieldModalOpen(true)}
          />
        </div>

        {/* 2. Center — Field configuration */}
        <div
          className={`lg:col-span-5 lg:block ${
            mobileTab === "configure" ? "block" : "hidden"
          }`}
        >
          <FieldConfigPanel
            field={selectedField}
            onUpdateField={handleUpdateField}
            onRemoveField={handleRemoveField}
            onOpenAddField={() => setIsAddFieldModalOpen(true)}
          />
        </div>

        {/* 3. Right — Live preview */}
        <div
          className={`lg:col-span-4 lg:block ${
            mobileTab === "preview" ? "block" : "hidden"
          }`}
        >
          <FormPreview
            fields={fields}
            eventName={eventName}
            isModalOpen={isPreviewModalOpen}
            onCloseModal={() => setIsPreviewModalOpen(false)}
            onOpenModal={() => setIsPreviewModalOpen(true)}
          />
        </div>
      </div>

      {/* Add Field Picker Modal */}
      <AddFieldModal
        isOpen={isAddFieldModalOpen}
        onClose={() => setIsAddFieldModalOpen(false)}
        onAddField={handleAddField}
        existingFields={fields}
      />
    </div>
  );
}
