"use client";

import { useActionState, useState } from "react";
import { updateOrganizationAction } from "@/app/actions/org.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Pencil, Sparkles, Building2 } from "lucide-react";

interface OrgSettingsFormProps {
  initialName: string;
  slug: string;
  role: string;
  userEmail: string;
}

export function OrgSettingsForm({
  initialName,
  slug,
  role,
  userEmail,
}: OrgSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateOrganizationAction, null);
  const [isEditing, setIsEditing] = useState(false);
  const [orgName, setOrgName] = useState(initialName);
  const [copied, setCopied] = useState(false);

  const copySlug = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Edit Organization Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-medium">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Organization Information
              </h2>
              <p className="text-xs text-zinc-500">
                The public name displayed on attendee event pages and tickets
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Name
            </Button>
          )}
        </div>

        {state?.error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 font-medium flex items-center gap-2">
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && !isEditing && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{state.message}</span>
          </div>
        )}

        {isEditing ? (
          <form
            action={async (formData) => {
              await formAction(formData);
              setIsEditing(false);
            }}
            className="mt-5 space-y-4"
          >
            <div className="max-w-md">
              <Input
                label="Organization or Brand Name"
                name="organizationName"
                id="organizationName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Gazi Events Inc."
                required
                autoFocus
              />
              <p className="text-[11px] text-zinc-400 mt-1.5">
                This will update the host name across all your published events.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" size="sm" isLoading={isPending}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setOrgName(initialName);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Current Name
              </span>
              <div className="text-base font-semibold text-zinc-900">
                {orgName}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Workspace Handle
                </span>
                <button
                  type="button"
                  onClick={copySlug}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-mono transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600 font-sans">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-sm font-mono text-zinc-800 font-medium">
                /{slug}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
