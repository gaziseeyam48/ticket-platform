export type OnboardingMode = "every_event" | "first_event";

export type OnboardingStatus = "in_progress" | "completed" | "dismissed";

export type OnboardingStepId =
  // Journey A: Registration Form Builder
  | "form_intro"
  | "form_outline"
  | "form_add_field"
  | "form_field_config"
  | "form_preview"
  | "form_save"
  | "form_building"
  // Journey B: Event Workspace & Next Steps
  | "workspace_review"
  | "workspace_status"
  | "workspace_tickets"
  | "workspace_management"
  | "journey_completed";

export interface OnboardingState {
  version: number;
  status: OnboardingStatus;
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  isSaved?: boolean;
  waitingForFirstSave?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StepDynamicContext {
  eventName?: string;
  eventSlug?: string;
  eventType?: "FREE" | "PAID";
  eventStatus?: string;
  customFieldsCount?: number;
  hasUnsavedChanges?: boolean;
}

export interface TourStepDefinition {
  id: OnboardingStepId;
  journey: "builder" | "workspace";
  targetTourId: string;
  title: string;
  description: string | ((context: StepDynamicContext) => string);
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  stepNumber: number;
  totalStepsInJourney: number;
  primaryActionLabel?: string;
  allowSkip?: boolean;
}
