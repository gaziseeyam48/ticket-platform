import { OnboardingMode, OnboardingState } from "./types";

/**
 * Resolves the active onboarding mode from environment variables.
 * Defaults to "every_event" to enable seamless QA and testing across multiple events.
 */
export function getOnboardingMode(): OnboardingMode {
  const envMode = process.env.NEXT_PUBLIC_ONBOARDING_MODE || process.env.ONBOARDING_MODE;
  if (envMode === "first_event") {
    return "first_event";
  }
  return "every_event";
}

/**
 * Server-authoritative eligibility check.
 *
 * Rules:
 * - In "every_event" mode: Every newly created event is eligible for onboarding.
 * - In "first_event" mode: Only the organization's first event is eligible.
 *   Server rule for deleted events: The check inspects active events in the organization.
 *   If the organization currently has 0 events prior to creation, this event is their first event.
 */
export async function checkOnboardingEligibility(
  adminDb: any,
  organizationId: string
): Promise<{
  isEligible: boolean;
  mode: OnboardingMode;
  existingCount: number;
}> {
  const mode = getOnboardingMode();

  if (mode === "every_event") {
    return {
      isEligible: true,
      mode: "every_event",
      existingCount: -1,
    };
  }

  // Production mode: Server-authoritative query of existing events
  const { count, error } = await adminDb
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    console.error("Error checking organization event count for onboarding:", error);
    // Graceful fallback to false in production on DB count error
    return { isEligible: false, mode: "first_event", existingCount: 0 };
  }

  const existingCount = count ?? 0;
  // If evaluated prior to the new event insertion, existingCount must be 0
  const isEligible = existingCount === 0;

  return {
    isEligible,
    mode: "first_event",
    existingCount,
  };
}

/**
 * Creates the initial OnboardingState record to persist in event.settings.
 */
export function createInitialOnboardingState(): OnboardingState {
  const now = new Date().toISOString();
  return {
    version: 1,
    status: "in_progress",
    currentStep: "form_intro",
    completedSteps: [],
    isSaved: false,
    createdAt: now,
    updatedAt: now,
  };
}
