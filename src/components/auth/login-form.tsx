"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <Card className="border-zinc-200 bg-white shadow-xs">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">
          Sign in to your organization
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Enter your credentials to manage your events.
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
            <label className="text-xs font-medium text-zinc-700" htmlFor="email">
              Email Address
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
            Sign In
          </Button>
          <p className="text-xs text-center text-zinc-500">
            Don&apos;t have an organization yet?{" "}
            <Link href="/signup" className="font-semibold text-zinc-900 hover:underline">
              Create one here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
