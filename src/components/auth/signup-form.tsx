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
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100">
          Create an account
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your details below to create your organization.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <p>{state.error}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="organizationName">
              Organization Name
            </label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="Acme Events Inc."
              required
              disabled={isPending}
              className="bg-zinc-950/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isPending}
              className="bg-zinc-950/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              className="bg-zinc-950/50"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Create account"}
          </Button>
          <div className="text-sm text-center text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-white underline underline-offset-4 hover:no-underline transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
