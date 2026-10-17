import { OnboardingStepId, TourStepDefinition, StepDynamicContext } from "./types";

export const ONBOARDING_STEPS: Record<OnboardingStepId, TourStepDefinition> = {
  // Journey A: Registration Form Builder
  form_intro: {
    id: "form_intro",
    journey: "builder",
    targetTourId: "form-builder-heading",
    title: "Let's set up your registration form.",
    description:
      "Choose what information attendees need to provide when they register for this event. Required fields must remain compatible with ticket issuance.",
    placement: "bottom",
    stepNumber: 1,
    totalStepsInJourney: 6,
    primaryActionLabel: "Next",
  },
  form_outline: {
    id: "form_outline",
    journey: "builder",
    targetTourId: "form-outline",
    title: "Start with the information you need.",
    description:
      "Your form already includes essential fields (Full Name and Email Address). You can add more questions and arrange them in the order attendees will see them.",
    placement: "right",
    stepNumber: 2,
    totalStepsInJourney: 6,
    primaryActionLabel: "Next",
  },
  form_add_field: {
    id: "form_add_field",
    journey: "builder",
    targetTourId: "add-field-button",
    title: "Need more information from attendees?",
    description:
      "Add a field for questions such as phone number, department, ticket preferences, or other details relevant to your event. Click 'Add field' to choose a field type, or click Next if you have what you need.",
    placement: "bottom",
    stepNumber: 3,
    totalStepsInJourney: 6,
    primaryActionLabel: "Next",
  },
  form_field_config: {
    id: "form_field_config",
    journey: "builder",
    targetTourId: "field-config-panel",
    title: "Make each question clear.",
    description:
      "Give the field a clear label, add helpful placeholder text when useful, and decide whether attendees must answer it. System fields are locked to guarantee ticket delivery.",
    placement: "left",
    stepNumber: 4,
    totalStepsInJourney: 6,
    primaryActionLabel: "Next",
  },
  form_preview: {
    id: "form_preview",
    journey: "builder",
    targetTourId: "preview-button",
    title: "See what attendees will see.",
    description:
      "Check your questions, their order, and how the form looks before saving. You can toggle live preview anytime without losing your draft.",
    placement: "bottom",
    stepNumber: 5,
    totalStepsInJourney: 6,
    primaryActionLabel: "Next",
  },
  form_save: {
    id: "form_save",
    journey: "builder",
    targetTourId: "save-form-button",
    title: "Build your form & save when ready.",
    description:
      "Take your time to add, configure, and organize attendee questions. Whenever you save your form for the first time, your second journey — event setup — will automatically begin.",
    placement: "bottom",
    stepNumber: 6,
    totalStepsInJourney: 6,
    primaryActionLabel: "Start Building",
  },
  form_building: {
    id: "form_building",
    journey: "builder",
    targetTourId: "save-form-button",
    title: "Customize your form.",
    description:
      "Add or edit questions. When you save your changes for the first time, event setup will begin.",
    placement: "bottom",
    stepNumber: 6,
    totalStepsInJourney: 6,
    primaryActionLabel: "Save Form",
  },

  // Journey B: Event Workspace & Next Steps
  workspace_review: {
    id: "workspace_review",
    journey: "workspace",
    targetTourId: "event-parameters",
    title: "Give your event a final check.",
    description:
      "Make sure the date, venue, and event information are correct before sharing the registration page. Find your public event link here.",
    placement: "top",
    stepNumber: 1,
    totalStepsInJourney: 4,
    primaryActionLabel: "Next",
  },
  workspace_status: {
    id: "workspace_status",
    journey: "workspace",
    targetTourId: "lifecycle-panel",
    title: "Understand the event's current status.",
    description: (ctx: StepDynamicContext) => {
      if (ctx.eventStatus === "PUBLISHED") {
        return "Your event is Published! The public registration page is active and accepting attendee signups.";
      }
      if (ctx.eventStatus === "LIVE") {
        return "Your event is Live! Doors are open, and gate scanners can verify passes.";
      }
      return "Your event is in Draft. When ready, publish your event here so the public registration page becomes accessible to attendees.";
    },
    placement: "left",
    stepNumber: 2,
    totalStepsInJourney: 4,
    primaryActionLabel: "Next",
  },
  workspace_tickets: {
    id: "workspace_tickets",
    journey: "workspace",
    targetTourId: "ticket-metrics",
    title: "Ticket issuance & admission.",
    description: (ctx: StepDynamicContext) => {
      if (ctx.eventType === "PAID") {
        return "Attendees submit payment details during registration. You review and approve payments in the Payments tab to issue their entrance passes.";
      }
      return "For free events, tickets with entrance QR codes are automatically generated upon attendee registration and emailed directly to participants.";
    },
    placement: "bottom",
    stepNumber: 3,
    totalStepsInJourney: 4,
    primaryActionLabel: "Next",
  },
  workspace_management: {
    id: "workspace_management",
    journey: "workspace",
    targetTourId: "workspace-tabs",
    title: "Manage registrations, tickets, and gates.",
    description:
      "Use these tabs to monitor attendee registrations, track issued tickets, and invite gate staff to scan QR passes at the entrance.",
    placement: "bottom",
    stepNumber: 4,
    totalStepsInJourney: 4,
    primaryActionLabel: "Finish Setup",
  },

  // Journey Completion
  journey_completed: {
    id: "journey_completed",
    journey: "workspace",
    targetTourId: "workspace-tabs",
    title: "You're ready for the next step!",
    description:
      "Your event setup is in place. You can return here anytime to manage registrations, tickets, and event activity.",
    placement: "auto",
    stepNumber: 4,
    totalStepsInJourney: 4,
    primaryActionLabel: "Done",
  },
};

export const BUILDER_STEPS_ORDER: OnboardingStepId[] = [
  "form_intro",
  "form_outline",
  "form_add_field",
  "form_field_config",
  "form_preview",
  "form_save",
];

export const WORKSPACE_STEPS_ORDER: OnboardingStepId[] = [
  "workspace_review",
  "workspace_status",
  "workspace_tickets",
  "workspace_management",
];
