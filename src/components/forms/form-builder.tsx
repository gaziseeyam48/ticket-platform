"use client";

import { useState } from "react";
import { FormField, FieldType, FIELD_TYPES } from "@/lib/validations/form";
import { saveRegistrationForm } from "@/app/actions/form.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Type,
  Mail,
  Phone,
  Hash,
  ListFilter,
  CheckCircle2,
  CheckSquare,
  AlignLeft,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Settings2,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

interface FormBuilderProps {
  eventId: string;
  initialFields: FormField[];
  eventName: string;
  eventSlug: string;
}

const FIELD_TYPE_METADATA: Record<
  FieldType,
  { label: string; description: string; icon: LucideIcon; defaultPlaceholder: string }
> = {
  text: {
    label: "Short Text",
    description: "Single-line text input for names or titles",
    icon: Type,
    defaultPlaceholder: "e.g. Job Title, Company, or University",
  },
  email: {
    label: "Email",
    description: "Email address with automatic format check",
    icon: Mail,
    defaultPlaceholder: "attendee@example.com",
  },
  phone: {
    label: "Phone",
    description: "Contact number with international format check",
    icon: Phone,
    defaultPlaceholder: "+1 (555) 000-0000",
  },
  number: {
    label: "Number",
    description: "Numeric input for age or quantities",
    icon: Hash,
    defaultPlaceholder: "e.g. 25",
  },
  dropdown: {
    label: "Dropdown Select",
    description: "Single-choice selection from a menu",
    icon: ListFilter,
    defaultPlaceholder: "Select option...",
  },
  radio: {
    label: "Radio Choices",
    description: "Single selection from visible options",
    icon: CheckCircle2,
    defaultPlaceholder: "",
  },
  checkbox: {
    label: "Consent Checkbox",
    description: "Single boolean toggle or agreement",
    icon: CheckSquare,
    defaultPlaceholder: "I agree to the attendee terms and conduct policy.",
  },
  textarea: {
    label: "Long Text",
    description: "Multi-line text area for notes or bios",
    icon: AlignLeft,
    defaultPlaceholder: "Provide additional details...",
  },
};

export function FormBuilder({
  eventId,
  initialFields,
  eventName,
  eventSlug,
}: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Preview form test state
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Field manipulation helpers
  const addField = (type: FieldType) => {
    const meta = FIELD_TYPE_METADATA[type];
    const newId = `field_${Date.now().toString(36)}_${fields.length + 1}`;
    const newField: FormField = {
      id: newId,
      type,
      label: meta.label,
      placeholder: meta.defaultPlaceholder,
      required: false,
      order: fields.length,
      options: type === "dropdown" || type === "radio" ? ["Option 1", "Option 2"] : [],
      isSystem: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const newFields = [...fields];
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);

    // Update order indices
    setFields(newFields.map((f, idx) => ({ ...f, order: idx })));
  };

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    updateField(fieldId, { options: newOptions });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const currentOptions = [...(field.options || [])];
    currentOptions[optionIndex] = value;
    updateField(fieldId, { options: currentOptions });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const currentOptions = (field.options || []).filter((_, idx) => idx !== optionIndex);
    updateField(fieldId, { options: currentOptions });
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      await saveRegistrationForm(eventId, fields);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save registration form.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-zinc-600" />
              Registration Form Builder
            </h2>
            <Badge variant="outline" className="text-zinc-600">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Questions for attendees registering at <span className="font-mono text-zinc-700">/{eventSlug}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 border border-zinc-200">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "builder"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "preview"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </button>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="font-semibold"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Saved
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Save Form
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Validation Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="font-medium">Registration form configuration saved successfully.</p>
        </div>
      )}

      {/* Main View Area */}
      {activeTab === "builder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left / Main Column: Fields List */}
          <div className="lg:col-span-3 space-y-4">
            {fields.map((field, index) => {
              const meta = FIELD_TYPE_METADATA[field.type];
              const Icon = meta.icon;
              const isFirst = index === 0;
              const isLast = index === fields.length - 1;

              return (
                <div
                  key={field.id}
                  className="rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs p-5 space-y-4"
                >
                  {/* Field Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900">
                            {meta.label}
                          </span>
                          {field.isSystem && (
                            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-zinc-100 text-zinc-500 border border-zinc-200">
                              System Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">ID: {field.id}</p>
                      </div>
                    </div>

                    {/* Actions: Reorder and Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveField(index, "up")}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, "down")}
                        disabled={isLast}
                        title="Move Down"
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      {!field.isSystem ? (
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          title="Remove Field"
                          className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Field Settings Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Label Input */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Field Label <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Label"
                      />
                    </div>

                    {/* Placeholder Input */}
                    {field.type !== "checkbox" && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">
                          Placeholder Text
                        </label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder={meta.defaultPlaceholder}
                        />
                      </div>
                    )}

                    {/* Required Checkbox Toggle */}
                    <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                      <div>
                        <span className="text-xs font-medium text-zinc-900">Required Field</span>
                        <p className="text-[11px] text-zinc-500">
                          {field.isSystem
                            ? "Core identification fields are required for ticket issuance."
                            : "Attendees must complete this before registering."}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          disabled={field.isSystem}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>

                  {/* Options Manager (for dropdown and radio) */}
                  {(field.type === "dropdown" || field.type === "radio") && (
                    <div className="pt-2 border-t border-zinc-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                          <ListFilter className="h-3.5 w-3.5 text-zinc-500" />
                          Options List <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(field.id)}
                          className="text-xs font-medium text-zinc-700 hover:text-zinc-900 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(field.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400 w-5 text-right font-mono">
                              {optIndex + 1}.
                            </span>
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                              className="text-xs h-9"
                            />
                            {(field.options || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(field.id, optIndex)}
                                title="Remove Option"
                                className="text-zinc-400 hover:text-red-600 p-1.5 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Add New Field */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
            <Card className="border-zinc-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-zinc-900">
                  <Plus className="h-4 w-4 text-zinc-500" />
                  Add Field
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Append a field to your form.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {FIELD_TYPES.map((type) => {
                  const meta = FIELD_TYPE_METADATA[type];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addField(type)}
                      className="w-full text-left p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors flex items-center gap-2.5 group"
                    >
                      <div className="h-6 w-6 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-800">
                          {meta.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-800 font-medium">
                <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
                Organizer Tip
              </div>
              <p className="leading-relaxed">
                Keep questions minimal. Requiring too many fields increases abandonment at registration.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Live Interactive Form Preview */
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="border-zinc-200 bg-white shadow-xs">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Live Registration Preview
              </span>
              <CardTitle className="text-xl font-bold text-zinc-900">{eventName}</CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Fill out the fields to preview the attendee experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {fields.map((field) => {
                const isFieldRequired = field.required;
                const value = (previewValues[field.id] as string | undefined) ?? "";

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-700">
                      {field.label}{" "}
                      {isFieldRequired && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "text" && (
                      <Input
                        type="text"
                        placeholder={field.placeholder || "Enter text"}
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                      />
                    )}

                    {field.type === "email" && (
                      <Input
                        type="email"
                        placeholder={field.placeholder || "name@example.com"}
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                      />
                    )}

                    {field.type === "phone" && (
                      <Input
                        type="tel"
                        placeholder={field.placeholder || "+1 (555) 000-0000"}
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                      />
                    )}

                    {field.type === "number" && (
                      <Input
                        type="number"
                        placeholder={field.placeholder || "0"}
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder || "Type here..."}
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      />
                    )}

                    {field.type === "dropdown" && (
                      <select
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                      >
                        <option value="">{field.placeholder || "Select an option..."}</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "radio" && (
                      <div className="space-y-2 pt-1">
                        {(field.options || []).map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2.5 p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={value === opt}
                              onChange={(e) =>
                                setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                              }
                              className="text-zinc-900 focus:ring-zinc-900"
                            />
                            <span className="text-xs text-zinc-800">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === "checkbox" && (
                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) =>
                              setPreviewValues({ ...previewValues, [field.id]: e.target.checked })
                            }
                            className="rounded text-zinc-900 focus:ring-zinc-900 mt-0.5"
                          />
                          <span className="text-xs text-zinc-700">
                            {field.placeholder || "I agree to the terms and event guidelines."}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  onClick={() => {
                    setPreviewSubmitted(true);
                    setTimeout(() => setPreviewSubmitted(false), 3000);
                  }}
                  className="w-full font-semibold"
                >
                  {previewSubmitted ? "✓ Preview Validated Successfully" : "Register for Event"}
                </Button>
                <p className="text-center text-[11px] text-zinc-400 mt-2 font-mono">
                  Interactive preview mode only.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
