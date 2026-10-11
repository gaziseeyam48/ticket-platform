"use client";

import { useState } from "react";
import { FormField } from "@/lib/validations/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Check,
  AlertCircle,
  Eye,
  Maximize2,
  Calendar,
  Sparkles,
} from "lucide-react";

interface FormPreviewProps {
  fields: FormField[];
  eventName: string;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
  onOpenModal?: () => void;
}

export function FormPreview({
  fields,
  eventName,
  isModalOpen = false,
  onCloseModal,
  onOpenModal,
}: FormPreviewProps) {
  const [testValues, setTestValues] = useState<Record<string, string | boolean>>({});
  const [testErrors, setTestErrors] = useState<Record<string, string>>({});
  const [testSuccessMessage, setTestSuccessMessage] = useState("");

  const handleTestChange = (fieldId: string, val: string | boolean) => {
    setTestValues((prev) => ({ ...prev, [fieldId]: val }));
    if (testErrors[fieldId]) {
      setTestErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTestSuccessMessage("");

    // Validate required fields
    const errors: Record<string, string> = {};
    for (const f of fields) {
      const val = testValues[f.id];
      if (f.required) {
        if (f.type === "checkbox") {
          if (!val) {
            errors[f.id] = "Must be checked to continue";
          }
        } else if (!val || (typeof val === "string" && !val.trim())) {
          errors[f.id] = `${f.label} is required`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setTestErrors(errors);
      return;
    }

    setTestSuccessMessage("All required fields are valid! (Test submission simulated)");
    setTimeout(() => setTestSuccessMessage(""), 4000);
  };

  const renderFormContent = (isFullModal = false) => (
    <div className="space-y-4">
      {/* Event Header Banner Simulation */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px]">
            Attendee View
          </span>
          <span className="text-zinc-500">Sample Registration</span>
        </div>
        <h3 className="text-sm font-bold text-zinc-900 truncate">
          {eventName || "Your Event Name"}
        </h3>
      </div>

      {testSuccessMessage && (
        <div
          role="status"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2"
        >
          <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{testSuccessMessage}</span>
        </div>
      )}

      {/* Form Fields Rendered as Attendee Sees Them */}
      <form onSubmit={handleTestSubmit} className="space-y-3.5 pt-1">
        {fields.map((field) => {
          const val = (testValues[field.id] as string | undefined) ?? "";
          const isChecked = Boolean(testValues[field.id]);
          const error = testErrors[field.id];

          return (
            <div key={field.id} className="space-y-1 text-left">
              <label
                htmlFor={`preview-${field.id}`}
                className="block text-xs font-medium text-zinc-700"
              >
                {field.label}{" "}
                {field.required && (
                  <span className="text-red-500 font-bold" title="Required">
                    *
                  </span>
                )}
              </label>

              {/* Short text */}
              {field.type === "text" && (
                <Input
                  id={`preview-${field.id}`}
                  type="text"
                  placeholder={field.placeholder || "Enter your response"}
                  value={val}
                  onChange={(e) => handleTestChange(field.id, e.target.value)}
                  error={error}
                  className="text-xs h-9 bg-white"
                />
              )}

              {/* Email */}
              {field.type === "email" && (
                <Input
                  id={`preview-${field.id}`}
                  type="email"
                  placeholder={field.placeholder || "attendee@example.com"}
                  value={val}
                  onChange={(e) => handleTestChange(field.id, e.target.value)}
                  error={error}
                  className="text-xs h-9 bg-white"
                />
              )}

              {/* Phone */}
              {field.type === "phone" && (
                <Input
                  id={`preview-${field.id}`}
                  type="tel"
                  placeholder={field.placeholder || "+1 (555) 000-0000"}
                  value={val}
                  onChange={(e) => handleTestChange(field.id, e.target.value)}
                  error={error}
                  className="text-xs h-9 bg-white"
                />
              )}

              {/* Number */}
              {field.type === "number" && (
                <Input
                  id={`preview-${field.id}`}
                  type="number"
                  placeholder={field.placeholder || "0"}
                  value={val}
                  onChange={(e) => handleTestChange(field.id, e.target.value)}
                  error={error}
                  className="text-xs h-9 bg-white"
                />
              )}

              {/* Long text / Textarea */}
              {field.type === "textarea" && (
                <div>
                  <textarea
                    id={`preview-${field.id}`}
                    rows={2}
                    placeholder={field.placeholder || "Provide details here..."}
                    value={val}
                    onChange={(e) => handleTestChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
                  />
                  {error && <p className="text-[11px] text-red-600 mt-0.5">{error}</p>}
                </div>
              )}

              {/* Dropdown Select */}
              {field.type === "dropdown" && (
                <div>
                  <select
                    id={`preview-${field.id}`}
                    value={val}
                    onChange={(e) => handleTestChange(field.id, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
                  >
                    <option value="">{field.placeholder || "Select an option..."}</option>
                    {(field.options || []).map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {error && <p className="text-[11px] text-red-600 mt-0.5">{error}</p>}
                </div>
              )}

              {/* Radio choices */}
              {field.type === "radio" && (
                <div className="space-y-1.5 pt-0.5">
                  {(field.options || []).map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer text-xs text-zinc-800 transition-colors"
                    >
                      <input
                        type="radio"
                        name={`preview-${field.id}`}
                        value={opt}
                        checked={val === opt}
                        onChange={(e) => handleTestChange(field.id, e.target.value)}
                        className="text-zinc-900 focus:ring-zinc-900"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                  {error && <p className="text-[11px] text-red-600 mt-0.5">{error}</p>}
                </div>
              )}

              {/* Consent checkbox */}
              {field.type === "checkbox" && (
                <div>
                  <label className="flex items-start gap-2.5 p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer text-xs text-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      id={`preview-${field.id}`}
                      checked={isChecked}
                      onChange={(e) => handleTestChange(field.id, e.target.checked)}
                      className="rounded text-zinc-900 focus:ring-zinc-900 mt-0.5"
                    />
                    <span className="leading-tight">
                      {field.placeholder || field.label || "I agree to the event guidelines."}
                    </span>
                  </label>
                  {error && <p className="text-[11px] text-red-600 mt-0.5">{error}</p>}
                </div>
              )}
            </div>
          );
        })}

        {/* Test submit simulation button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full text-xs font-semibold h-9"
          >
            Test Registration Form
          </Button>
          <p className="text-[11px] text-center text-zinc-400 mt-1.5">
            Test mode: no emails sent or tickets created.
          </p>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {/* Side Column Preview Card */}
      <section
        aria-label="Live registration preview"
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Live preview
            </h2>
          </div>

          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              title="Expand to full screen"
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Expand preview modal"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {renderFormContent(false)}
      </section>

      {/* Dedicated Full Modal Preview */}
      {isModalOpen && onCloseModal && (
        <Modal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          title="Public Registration Form Preview"
          description="This is how attendees see and interact with your registration form."
          maxWidth="lg"
        >
          <div className="max-h-[75vh] overflow-y-auto px-1">
            {renderFormContent(true)}
          </div>
        </Modal>
      )}
    </>
  );
}
