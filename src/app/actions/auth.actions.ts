"use server";

import { createServerDbClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { rateLimiter } from "@/lib/utils/rate-limiter";
import { headers } from "next/headers";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signUpAction(prevState: any, formData: FormData) {
  // Rate limiting check
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const check = rateLimiter.check(`auth:signup:${ip}`, 5, 60 * 60_000);
    if (!check.allowed) {
      return { error: "Too many signup attempts from your network. Please try again later." };
    }
  } catch {
    // Ignore in non-header test environments
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const organizationName = formData.get("organizationName") as string;

  const result = signUpSchema.safeParse({ email, password, organizationName });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createServerDbClient();

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user account" };
  }

  // Generate a URL-friendly slug from the organization name
  const baseSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug}-${randomSuffix}`;

  const adminClient = getAdminClient();

  // 2. Create the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orgData, error: orgError } = await (adminClient.from("organizations") as any)
    .insert({
      name: organizationName,
      slug,
    })
    .select()
    .single();

  if (orgError || !orgData) {
    console.error("Organization creation error:", orgError);
    return { error: "Account created, but failed to create organization. Please contact support." };
  }

  // 3. Create the organization_users link as OWNER
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: linkError } = await (adminClient.from("organization_users") as any).insert({
    organization_id: orgData.id,
    user_id: authData.user.id,
    role: "OWNER",
  });

  if (linkError) {
    console.error("Org link error:", linkError);
    return { error: "Failed to set organization permissions. Please contact support." };
  }

  revalidatePath("/", "layout");
  redirect("/org");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loginAction(prevState: any, formData: FormData) {
  // Rate limiting check
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const check = rateLimiter.check(`auth:login:${ip}`, 5, 15 * 60_000);
    if (!check.allowed) {
      return { error: "Too many login attempts. Please wait 15 minutes before retrying." };
    }
  } catch {
    // Ignore in non-header test environments
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createServerDbClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/org");
}

export async function logoutAction() {
  const supabase = await createServerDbClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
