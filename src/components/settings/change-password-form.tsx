"use client";

import { useActionState, useState } from "react";
import { updatePasswordAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, KeyRound, Eye, EyeOff } from "lucide-react";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Account Password
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Update your password to keep your organizer account safe
          </p>
        </div>

        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-1.5"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Change Password
          </Button>
        )}
      </div>

      {state?.error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {state.error}
        </div>
      )}

      {state?.success && !showForm && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {showForm ? (
        <form
          action={async (formData) => {
            await formAction(formData);
            const err = (formData as any);
            // We check the result in state, keep form open if error
          }}
          className="mt-5 space-y-4 max-w-md"
        >
          <div className="relative">
            <Input
              label="New Password"
              name="newPassword"
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-zinc-400 hover:text-zinc-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div>
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Repeat your new password"
              required
              minLength={8}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" size="sm" isLoading={isPending}>
              Update Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
          <span className="font-mono text-zinc-400">••••••••••••</span>
          <span>(Last updated securely via Supabase Auth)</span>
        </div>
      )}
    </div>
  );
}
