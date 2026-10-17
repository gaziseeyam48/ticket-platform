"use server";

import { createServerDbClient as createClient } from "@/lib/db/server";
import { getAdminClient } from "@/lib/db/admin";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { OnboardingState, OnboardingStatus, OnboardingStepId } from "@/lib/onboarding/types";
import { getOnboardingMode, createInitialOnboardingState } from "@/lib/onboarding/server";
import { revalidatePath } from "next/cache";

async function verifyEventOrgMembership(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "You must be logged in.");
  }

  const adminDb = getAdminClient();
  const { data: event, error: eventErr } = await (adminDb as any)
    .from("events")
    .select("id, organization_id, name, slug, status, event_type, settings")
    .eq("id", eventId)
    .single();

  if (eventErr || !event) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found.");
  }

  const { data: membership } = await adminDb
    .from("organization_users")
    .select("role")
    .eq("organization_id", event.organization_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    throw new AppError(
      ERROR_CODES.FORBIDDEN,
      "You do not have permission to access onboarding for this event."
    );
  }

  return { user, adminDb, event };
}

/**
 * Fetch the current onboarding progress and active mode for a specific event.
 */
export async function getOnboardingProgress(eventId: string) {
  const { event } = await verifyEventOrgMembership(eventId);
  const mode = getOnboardingMode();

  const settings = event.settings || {};
  const onboarding = (settings.onboarding as OnboardingState) || null;

  return {
    onboarding,
    mode,
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      status: event.status,
      eventType: event.event_type,
    },
  };
}

/**
 * Persist incremental updates to an event's onboarding walkthrough state.
 */
export async function updateOnboardingProgress(
  eventId: string,
  updates: Partial<OnboardingState>
) {
  const { adminDb, event } = await verifyEventOrgMembership(eventId);

  const currentSettings = event.settings || {};
  const currentOnboarding: OnboardingState =
    (currentSettings.onboarding as OnboardingState) || createInitialOnboardingState();

  const updatedOnboarding: OnboardingState = {
    ...currentOnboarding,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const newSettings = {
    ...currentSettings,
    onboarding: updatedOnboarding,
  };

  const { error } = await (adminDb as any)
    .from("events")
    .update({ settings: newSettings, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) {
    console.error("Failed to update onboarding progress:", error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to save onboarding progress.");
  }

  return updatedOnboarding;
}

/**
 * Marks onboarding as completed for an event.
 */
export async function completeOnboarding(eventId: string) {
  const { adminDb, event } = await verifyEventOrgMembership(eventId);

  const currentSettings = event.settings || {};
  const currentOnboarding: OnboardingState =
    (currentSettings.onboarding as OnboardingState) || createInitialOnboardingState();

  const completedSteps = Array.from(
    new Set([...currentOnboarding.completedSteps, currentOnboarding.currentStep, "journey_completed" as OnboardingStepId])
  );

  const updatedOnboarding: OnboardingState = {
    ...currentOnboarding,
    status: "completed",
    currentStep: "journey_completed",
    completedSteps,
    updatedAt: new Date().toISOString(),
  };

  const newSettings = {
    ...currentSettings,
    onboarding: updatedOnboarding,
  };

  await (adminDb as any)
    .from("events")
    .update({ settings: newSettings, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath(`/org/events/${eventId}/form`);

  return updatedOnboarding;
}

/**
 * Dismisses/exits the onboarding tour without marking all steps complete.
 */
export async function dismissOnboarding(eventId: string) {
  const { adminDb, event } = await verifyEventOrgMembership(eventId);

  const currentSettings = event.settings || {};
  const currentOnboarding: OnboardingState =
    (currentSettings.onboarding as OnboardingState) || createInitialOnboardingState();

  const updatedOnboarding: OnboardingState = {
    ...currentOnboarding,
    status: "dismissed",
    updatedAt: new Date().toISOString(),
  };

  const newSettings = {
    ...currentSettings,
    onboarding: updatedOnboarding,
  };

  await (adminDb as any)
    .from("events")
    .update({ settings: newSettings, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  return updatedOnboarding;
}

/**
 * Developer & QA helper to restart/replay the walkthrough for an event.
 * Safe and non-destructive: only resets event.settings.onboarding.
 */
export async function resetOnboarding(eventId: string) {
  const { adminDb, event } = await verifyEventOrgMembership(eventId);

  const currentSettings = event.settings || {};
  const initialOnboarding = createInitialOnboardingState();

  const newSettings = {
    ...currentSettings,
    onboarding: initialOnboarding,
  };

  await (adminDb as any)
    .from("events")
    .update({ settings: newSettings, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  revalidatePath(`/org/events/${eventId}`);
  revalidatePath(`/org/events/${eventId}/form`);

  return initialOnboarding;
}
