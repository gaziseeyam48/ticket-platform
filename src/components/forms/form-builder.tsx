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
  Sparkles,
} from "lucide-react";

interface FormBuilderProps {
  eventId: string;
  initialFields: FormField[];
  eventName: string;
  eventSlug: string;
}

const FIELD_TYPE_METADATA: Record<
  FieldType,
  { label: string; description: string; icon: any; defaultPlaceholder: string }
> = {
  text: {
    label: "Short Text",
    description: "Single-line text input for names, titles, or brief answers",
    icon: Type,
    defaultPlaceholder: "e.g. Job Title, Company, or Student ID",
  },
  email: {
    label: "Email",
    description: "Email address with automatic format validation",
    icon: Mail,
    defaultPlaceholder: "name@domain.com",
  },
  phone: {
    label: "Phone",
    description: "Phone number with international number format check",
    icon: Phone,
    defaultPlaceholder: "+1 (555) 000-0000",
  },
  number: {
    label: "Number",
    description: "Numeric input for age, years of experience, or quantities",
    icon: Hash,
    defaultPlaceholder: "e.g. 25",
  },
  dropdown: {
    label: "Dropdown Select",
    description: "Single selection from a dropdown list of options",
    icon: ListFilter,
    defaultPlaceholder: "Select an option",
  },
  radio: {
    label: "Radio Choices",
    description: "Single selection where all options are visible at once",
    icon: CheckCircle2,
    defaultPlaceholder: "",
  },
  checkbox: {
    label: "Single Checkbox",
    description: "Agreement check, dietary requirement, or consent toggle",
    icon: CheckSquare,
    defaultPlaceholder: "",
  },
  textarea: {
    label: "Long Text",
    description: "Multi-line text area for bios, comments, or dietary notes",
    icon: AlignLeft,
    defaultPlaceholder: "Enter detailed response here...",
  },
};

export function FormBuilder({
  eventId,
  initialFields,
  eventName,
  eventSlug,
}: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(
    initialFields.length > 0
      ? initialFields
      : [
          {
            id: "field_name",
            type: "text",
            label: "Full Name",
            placeholder: "e.g. Alex Morgan",
            required: true,
            options: [],
            order: 0,
            isSystem: true,
          },
          {
            id: "field_email",
            type: "email",
            label: "Email Address",
            placeholder: "alex@example.com",
            required: true,
            options: [],
            order: 1,
            isSystem: true,
          },
        ]
  );

  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Field manipulation functions
  const addField = (type: FieldType) => {
    const meta = FIELD_TYPE_METADATA[type];
    const newId = `field_${Math.random().toString(36).substring(2, 9)}`;
    const newField: FormField = {
      id: newId,
      type,
      label: `New ${meta.label}`,
      placeholder: meta.defaultPlaceholder,
      required: false,
      options: type === "dropdown" || type === "radio" ? ["Option 1", "Option 2"] : [],
      order: fields.length,
      isSystem: false,
    };

    setFields([...fields, newField]);
    setSaveSuccess(false);
  };

  const removeField = (id: string) => {
    const fieldToRemove = fields.find((f) => f.id === id);
    if (fieldToRemove?.isSystem) return; // Prevent deleting system fields
    setFields(fields.filter((f) => f.id !== id));
    setSaveSuccess(false);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map((f) => {
        if (f.id === id) {
          return { ...f, ...updates };
        }
        return f;
      })
    );
    setSaveSuccess(false);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === fields.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newFields = [...fields];
    const [movedItem] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, movedItem);

    // Reassign orders
    const ordered = newFields.map((f, idx) => ({ ...f, order: idx }));
    setFields(ordered);
    setSaveSuccess(false);
  };

  // Option manipulations for dropdown / radio
  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const currentOptions = field.options || [];
    const newOptionName = `Option ${currentOptions.length + 1}`;
    updateField(fieldId, { options: [...currentOptions, newOptionName] });
  };

  const updateOption = (fieldId: string, optionIndex: number, newValue: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const currentOptions = [...(field.options || [])];
    currentOptions[optionIndex] = newValue;
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
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save registration form.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-indigo-400" />
              Registration Form Builder
            </h2>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Configure the questions and information collected from participants registering for{" "}
            <span className="text-zinc-200 font-medium">{eventName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="inline-flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "builder"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Live Preview
            </button>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-2 text-emerald-300">
                <Check className="h-4 w-4 text-emerald-400" />
                Saved!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Form
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Validation Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="font-medium">Registration form configuration saved successfully!</p>
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
                  className="group relative rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm p-5 space-y-4"
                >
                  {/* Field Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                            {meta.label}
                          </span>
                          {field.isSystem && (
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                              System Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono">ID: {field.id}</p>
                      </div>
                    </div>

                    {/* Actions: Reorder and Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveField(index, "up")}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, "down")}
                        disabled={isLast}
                        title="Move Down"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>

                      {!field.isSystem ? (
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          title="Remove Field"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Field Settings Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Label Input */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Field Label <span className="text-rose-400">*</span>
                      </label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Label"
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
                      />
                    </div>

                    {/* Placeholder Input (for text, email, phone, number, textarea) */}
                    {field.type !== "checkbox" && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          Placeholder Text
                        </label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder={meta.defaultPlaceholder}
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Required Checkbox Toggle */}
                    <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                      <div>
                        <span className="text-xs font-medium text-zinc-200">Required Field</span>
                        <p className="text-[11px] text-zinc-500">
                          {field.isSystem
                            ? "Core identification fields are required for ticket issuance."
                            : "Participants must provide a value before submitting."}
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
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>

                  {/* Options Manager (for dropdown and radio) */}
                  {(field.type === "dropdown" || field.type === "radio") && (
                    <div className="pt-2 border-t border-zinc-800/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                          <ListFilter className="h-3.5 w-3.5 text-indigo-400" />
                          Options List <span className="text-rose-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(field.id)}
                          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(field.options || []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 w-5 text-right font-mono">
                              {optIndex + 1}.
                            </span>
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                              className="bg-zinc-950 border-zinc-800 text-zinc-100 text-xs h-9"
                            />
                            {(field.options || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(field.id, optIndex)}
                                title="Remove Option"
                                className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
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

          {/* Right Column: Palette / Add New Field */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-400" />
                  Add Field
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Select a field type to append to your registration form.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {FIELD_TYPES.map((type) => {
                  const meta = FIELD_TYPE_METADATA[type];
                  const Icon = meta.icon;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addField(type)}
                      className="w-full text-left p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-800/60 hover:border-indigo-500/40 transition-all flex items-start gap-3 group"
                    >
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {meta.label}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">
                          {meta.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                Tips for Organizers
              </div>
              <p>
                Keep registrations lean. Required fields increase drop-off rate, so only ask for details essential to ticketing and attendee verification.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Live Interactive Form Preview */
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <p>
              This is a live preview rendering of your registration form. Test typing and selecting options to verify attendee experience!
            </p>
          </div>

          <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur shadow-2xl">
            <CardHeader className="border-b border-zinc-800 pb-5">
              <div className="inline-block text-[11px] font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 mb-2">
                Event Registration
              </div>
              <CardTitle className="text-2xl text-zinc-100">{eventName}</CardTitle>
              <CardDescription className="text-sm text-zinc-400">
                Please complete all required fields below to reserve your ticket.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {fields.map((field) => {
                const isFieldRequired = field.required;
                const value = previewValues[field.id] || "";

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-200">
                      {field.label}{" "}
                      {isFieldRequired && <span className="text-rose-400">*</span>}
                    </label>

                    {/* Rendering by Type */}
                    {field.type === "text" && (
                      <Input
                        type="text"
                        placeholder={field.placeholder || "Enter text"}
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500"
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
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500"
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
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500"
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
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500"
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
                        className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    )}

                    {field.type === "dropdown" && (
                      <select
                        value={value}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                        }
                        className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
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
                            className="flex items-center gap-3 p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={value === opt}
                              onChange={(e) =>
                                setPreviewValues({ ...previewValues, [field.id]: e.target.value })
                              }
                              className="text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700"
                            />
                            <span className="text-sm text-zinc-200">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === "checkbox" && (
                      <div className="pt-1">
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-800/40 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) =>
                              setPreviewValues({ ...previewValues, [field.id]: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700 mt-0.5"
                          />
                          <span className="text-xs text-zinc-300">
                            {field.placeholder || "I agree to the terms and event guidelines."}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  onClick={() => {
                    setPreviewSubmitted(true);
                    setTimeout(() => setPreviewSubmitted(false), 3000);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 shadow-lg shadow-indigo-600/20"
                >
                  {previewSubmitted ? "✓ Preview Validated Successfully" : "Register for Event"}
                </Button>
                <p className="text-center text-[11px] text-zinc-500 mt-2">
                  Preview mode only. No tickets are generated from this test view.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
