"use client";

import { useActionState, useState } from "react";
import { updateOrganizationAction } from "@/app/actions/org.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Pencil } from "lucide-react";

interface OrgSettingsFormProps {
  initialName: string;
  slug: string;
}

export function OrgSettingsForm({
  initialName,
  slug,
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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Organization Details
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Your organization name and workspace handle shown to attendees
          </p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1.5 text-xs font-medium"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Name
          </Button>
        )}
      </div>

      {state?.error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {state.error}
        </div>
      )}

      {state?.success && !isEditing && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex items-center gap-2">
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
          className="mt-5 space-y-4 max-w-md"
        >
          <div>
            <Input
              label="Organization Name"
              name="organizationName"
              id="organizationName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Gazi Events Inc."
              required
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" size="sm" isLoading={isPending} className="text-sm font-medium">
              Save
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
              className="text-sm font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="text-sm text-zinc-600 font-medium">
              Organization Name
            </div>
            <div className="text-base font-semibold text-zinc-900">
              {orgName}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 font-medium">
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
  );
}
