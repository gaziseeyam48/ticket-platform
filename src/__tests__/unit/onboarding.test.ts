import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getOnboardingMode,
  checkOnboardingEligibility,
  createInitialOnboardingState,
} from "@/lib/onboarding/server";
import {
  ONBOARDING_STEPS,
  BUILDER_STEPS_ORDER,
  WORKSPACE_STEPS_ORDER,
} from "@/lib/onboarding/config";
import { OnboardingStepId, StepDynamicContext } from "@/lib/onboarding/types";

describe("Onboarding Walkthrough System", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe("1. Mode Resolution & Eligibility", () => {
    it("defaults to 'every_event' mode when env variable is not set", () => {
      delete process.env.NEXT_PUBLIC_ONBOARDING_MODE;
      delete process.env.ONBOARDING_MODE;

      expect(getOnboardingMode()).toBe("every_event");
    });

    it("respects NEXT_PUBLIC_ONBOARDING_MODE='first_event'", () => {
      vi.stubEnv("NEXT_PUBLIC_ONBOARDING_MODE", "first_event");

      expect(getOnboardingMode()).toBe("first_event");
    });

    it("respects NEXT_PUBLIC_ONBOARDING_MODE='every_event'", () => {
      vi.stubEnv("NEXT_PUBLIC_ONBOARDING_MODE", "every_event");

      expect(getOnboardingMode()).toBe("every_event");
    });

    it("in 'every_event' mode, always returns isEligible = true regardless of event count", async () => {
      vi.stubEnv("NEXT_PUBLIC_ONBOARDING_MODE", "every_event");

      const mockAdminDb = {
        from: vi.fn(),
      };

      const result = await checkOnboardingEligibility(mockAdminDb, "org-123");
      expect(result.isEligible).toBe(true);
      expect(result.mode).toBe("every_event");
      // In every_event mode, it does not even need to query existing count
      expect(mockAdminDb.from).not.toHaveBeenCalled();
    });

    it("in 'first_event' mode, returns isEligible = true if organization has 0 events", async () => {
      vi.stubEnv("NEXT_PUBLIC_ONBOARDING_MODE", "first_event");

      const mockAdminDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
      };

      const result = await checkOnboardingEligibility(mockAdminDb, "org-123");
      expect(result.isEligible).toBe(true);
      expect(result.mode).toBe("first_event");
      expect(result.existingCount).toBe(0);
    });

    it("in 'first_event' mode, returns isEligible = false if organization already has events", async () => {
      vi.stubEnv("NEXT_PUBLIC_ONBOARDING_MODE", "first_event");

      const mockAdminDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
          }),
        }),
      };

      const result = await checkOnboardingEligibility(mockAdminDb, "org-123");
      expect(result.isEligible).toBe(false);
      expect(result.mode).toBe("first_event");
      expect(result.existingCount).toBe(3);
    });

    it("in 'first_event' mode, handles deleted events server rule (0 active events = eligible)", async () => {
      vi.stubEnv("NEXT_PUBLIC_ONBOARDING_MODE", "first_event");

      // An organization created an event previously, but currently has 0 active events in DB
      const mockAdminDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        }),
      };

      const result = await checkOnboardingEligibility(mockAdminDb, "org-123");
      expect(result.isEligible).toBe(true);
    });
  });

  describe("2. Initial State Factory", () => {
    it("creates standard initial onboarding state", () => {
      const state = createInitialOnboardingState();

      expect(state.version).toBe(1);
      expect(state.status).toBe("in_progress");
      expect(state.currentStep).toBe("form_intro");
      expect(state.completedSteps).toEqual([]);
      expect(state.isSaved).toBe(false);
      expect(new Date(state.createdAt).getTime()).toBeGreaterThan(0);
      expect(new Date(state.updatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe("3. Step Registry & Journey Progression", () => {
    it("contains all 6 steps of Journey A in logical sequence", () => {
      expect(BUILDER_STEPS_ORDER).toEqual([
        "form_intro",
        "form_outline",
        "form_add_field",
        "form_field_config",
        "form_preview",
        "form_save",
      ]);

      BUILDER_STEPS_ORDER.forEach((stepId, index) => {
        const step = ONBOARDING_STEPS[stepId];
        expect(step).toBeDefined();
        expect(step.journey).toBe("builder");
        expect(step.stepNumber).toBe(index + 1);
        expect(step.totalStepsInJourney).toBe(6);
      });
    });

    it("contains all 4 steps of Journey B in logical sequence", () => {
      expect(WORKSPACE_STEPS_ORDER).toEqual([
        "workspace_review",
        "workspace_status",
        "workspace_tickets",
        "workspace_management",
      ]);

      WORKSPACE_STEPS_ORDER.forEach((stepId, index) => {
        const step = ONBOARDING_STEPS[stepId];
        expect(step).toBeDefined();
        expect(step.journey).toBe("workspace");
        expect(step.stepNumber).toBe(index + 1);
        expect(step.totalStepsInJourney).toBe(4);
      });
    });

    it("has completion state defined", () => {
      const completion = ONBOARDING_STEPS["journey_completed"];
      expect(completion).toBeDefined();
      expect(completion.title).toContain("ready for the next step");
    });
  });

  describe("4. Dynamic Step Descriptions & Context Reactivity", () => {
    it("provides clear instructions for building form and saving when ready", () => {
      const saveStep = ONBOARDING_STEPS["form_save"];
      expect(saveStep.title).toContain("Build your form");
      expect(typeof saveStep.description === "string" ? saveStep.description : "").toContain("Whenever you save your form for the first time");
      expect(saveStep.primaryActionLabel).toBe("Start Building");
    });

    it("generates contextual descriptions for event lifecycle status", () => {
      const statusStep = ONBOARDING_STEPS["workspace_status"];
      const descFn = statusStep.description as (ctx: StepDynamicContext) => string;

      expect(descFn({ eventStatus: "DRAFT" })).toContain("Draft");
      expect(descFn({ eventStatus: "PUBLISHED" })).toContain("Published");
      expect(descFn({ eventStatus: "LIVE" })).toContain("Live");
    });

    it("generates contextual descriptions for ticket issuance based on FREE vs PAID", () => {
      const ticketStep = ONBOARDING_STEPS["workspace_tickets"];
      const descFn = ticketStep.description as (ctx: StepDynamicContext) => string;

      const freeDesc = descFn({ eventType: "FREE" });
      expect(freeDesc).toContain("automatically generated");

      const paidDesc = descFn({ eventType: "PAID" });
      expect(paidDesc).toContain("Payments tab");
    });
  });

  describe("5. Target Data-Tour Identifiers", () => {
    it("associates stable data-tour identifiers with every step", () => {
      const expectedTargets: Record<OnboardingStepId, string> = {
        form_intro: "form-builder-heading",
        form_outline: "form-outline",
        form_add_field: "add-field-button",
        form_field_config: "field-config-panel",
        form_preview: "preview-button",
        form_save: "save-form-button",
        form_building: "save-form-button",
        workspace_review: "event-parameters",
        workspace_status: "lifecycle-panel",
        workspace_tickets: "ticket-metrics",
        workspace_management: "workspace-tabs",
        journey_completed: "workspace-tabs",
      };

      Object.entries(expectedTargets).forEach(([stepId, target]) => {
        expect(ONBOARDING_STEPS[stepId as OnboardingStepId].targetTourId).toBe(target);
      });
    });
  });
});
