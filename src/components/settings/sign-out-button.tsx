"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      isLoading={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to sign out of your account?")) {
          startTransition(async () => {
            await logoutAction();
          });
        }
      }}
      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign Out
    </Button>
  );
}
