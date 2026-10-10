"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <Card className="border-zinc-200 bg-white shadow-xs">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">
          Create an organization
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Set up your workspace to begin issuing passes.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{state.error}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700" htmlFor="organizationName">
              Organization Name
            </label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="e.g. Gotham Arts Collective"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700" htmlFor="email">
              Admin Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="organizer@example.com"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              required
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isPending}
            isLoading={isPending}
          >
            Create Workspace
          </Button>
          <p className="text-xs text-center text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
