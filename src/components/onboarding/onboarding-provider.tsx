"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  OnboardingStepId,
  OnboardingState,
  StepDynamicContext,
} from "@/lib/onboarding/types";
import {
  ONBOARDING_STEPS,
  BUILDER_STEPS_ORDER,
  WORKSPACE_STEPS_ORDER,
} from "@/lib/onboarding/config";
import {
  getOnboardingProgress,
  updateOnboardingProgress,
  completeOnboarding,
  dismissOnboarding,
  resetOnboarding,
} from "@/app/actions/onboarding.actions";
import { TourSpotlight } from "./tour-spotlight";
import { TourPopover } from "./tour-popover";
import { TourCompletionDialog } from "./tour-completion-dialog";

interface OnboardingContextType {
  isActive: boolean;
  currentStepId: OnboardingStepId | null;
  onboardingState: OnboardingState | null;
  isWaitingForFormSave: boolean;
  handleFormSaved: () => Promise<void>;
  replayTour: () => Promise<void>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  skipTour: () => Promise<void>;
  exitTour: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      isActive: false,
      currentStepId: null,
      onboardingState: null,
      isWaitingForFormSave: false,
      handleFormSaved: async () => {},
      replayTour: async () => {},
      nextStep: async () => {},
      prevStep: () => {},
      skipTour: async () => {},
      exitTour: async () => {},
    };
  }
  return ctx;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route-derived event ID
  const eventId = React.useMemo(() => {
    const match = pathname.match(/\/org\/events\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    const id = match[1];
    if (id === "new") return null;
    return id;
  }, [pathname]);

  const isFormBuilderPage = pathname.endsWith("/form");
  const isWorkspacePage = !!eventId && !isFormBuilderPage && !pathname.endsWith("/edit");

  // Tour active state
  const [isActive, setIsActive] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<OnboardingStepId | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [eventData, setEventData] = useState<{
    id: string;
    name: string;
    slug: string;
    status: string;
    eventType: "FREE" | "PAID";
  } | null>(null);

  // Target DOM measurement state
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const activeStepDef = currentStepId ? ONBOARDING_STEPS[currentStepId] : null;

  // Measure target element in DOM
  const updateTargetRect = useCallback(() => {
    if (!activeStepDef || !isActive) {
      setTargetRect(null);
      return;
    }

    const targetEl = document.querySelector(
      `[data-tour="${activeStepDef.targetTourId}"]`
    );

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [activeStepDef, isActive]);

  // Window resize & scroll listeners for target positioning
  useEffect(() => {
    if (!isActive) return;

    updateTargetRect();
    const handleScrollOrResize = () => {
      requestAnimationFrame(updateTargetRect);
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isActive, updateTargetRect]);

  // Periodic DOM poll for dynamic components (e.g. modals opening, tabs rendering)
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(updateTargetRect, 400);
    return () => clearInterval(interval);
  }, [isActive, updateTargetRect]);

  // Synchronize onboarding state with server for current event
  useEffect(() => {
    if (!eventId) {
      setIsActive(false);
      setCurrentStepId(null);
      return;
    }

    let isCancelled = false;

    async function loadProgress() {
      try {
        const result = await getOnboardingProgress(eventId!);
        if (isCancelled) return;

        setEventData(result.event as any);
        const state = result.onboarding;
        setOnboardingState(state);

        const urlWantsOnboarding = searchParams.get("onboarding") === "1" || searchParams.get("onboarding") === "true";

        // If tour is already completed or dismissed, never reopen or resume it
        if (state && (state.status === "completed" || state.status === "dismissed")) {
          setIsActive(false);
          setCurrentStepId(null);
          if (urlWantsOnboarding) {
            router.replace(pathname);
          }
          return;
        }

        if (state && state.status === "in_progress") {
          // Sync step with route
          if (isFormBuilderPage) {
            if (state.currentStep === "form_building") {
              // User is currently building the form; keep popover hidden
              setIsActive(false);
              setCurrentStepId("form_building");
            } else if (BUILDER_STEPS_ORDER.includes(state.currentStep)) {
              setIsActive(true);
              setCurrentStepId(state.currentStep);
            } else {
              setIsActive(true);
              setCurrentStepId("form_intro");
            }
          } else if (isWorkspacePage) {
            // In workspace, ensure step is in WORKSPACE_STEPS_ORDER
            setIsActive(true);
            if (WORKSPACE_STEPS_ORDER.includes(state.currentStep)) {
              setCurrentStepId(state.currentStep);
            } else {
              setCurrentStepId("workspace_review");
            }
          }
        } else if (urlWantsOnboarding) {
          // If URL parameter requests onboarding and state is not in_progress/completed, start it
          setIsActive(true);
          const initialStep = isFormBuilderPage ? "form_intro" : "workspace_review";
          setCurrentStepId(initialStep);
        } else {
          setIsActive(false);
          setCurrentStepId(null);
        }
      } catch (err) {
        console.error("Error loading onboarding progress:", err);
      }
    }

    loadProgress();

    return () => {
      isCancelled = true;
    };
  }, [eventId, isFormBuilderPage, isWorkspacePage, searchParams, pathname, router]);

  // Screen reader announcer
  useEffect(() => {
    if (activeStepDef && isActive) {
      setAnnouncement(`Onboarding step: ${activeStepDef.title}`);
    }
  }, [activeStepDef, isActive]);

  // Scroll target element smoothly into view
  useEffect(() => {
    if (!activeStepDef || !isActive) return;

    const timer = setTimeout(() => {
      const targetEl = document.querySelector(
        `[data-tour="${activeStepDef.targetTourId}"]`
      );
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        updateTargetRect();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeStepDef, isActive, updateTargetRect]);

  // Step advancement - optimistic & immediate response (0ms delay)
  const nextStep = useCallback(async () => {
    if (!eventId || !currentStepId || !activeStepDef) return;

    try {
      if (activeStepDef.journey === "builder") {
        const currentIndex = BUILDER_STEPS_ORDER.indexOf(currentStepId);

        // If at the end of builder walkthrough (Step 6: form_save)
        // Give the user freedom to build their form without popups!
        if (currentIndex === BUILDER_STEPS_ORDER.length - 1) {
          const updatedCompleted = Array.from(
            new Set([...(onboardingState?.completedSteps || []), currentStepId])
          );

          // Immediately close the popover and spotlight so user can build form freely
          setIsActive(false);
          setCurrentStepId("form_building");
          setOnboardingState((prev) =>
            prev
              ? {
                  ...prev,
                  currentStep: "form_building",
                  completedSteps: updatedCompleted,
                  waitingForFirstSave: true,
                }
              : null
          );

          // Asynchronously persist progress in background
          updateOnboardingProgress(eventId, {
            currentStep: "form_building",
            completedSteps: updatedCompleted,
            waitingForFirstSave: true,
          }).catch((err) => {
            console.error("Failed to update onboarding progress in background:", err);
          });

          return;
        }

        const nextStepId = BUILDER_STEPS_ORDER[currentIndex + 1];
        const updatedCompleted = Array.from(
          new Set([...(onboardingState?.completedSteps || []), currentStepId])
        );

        // Immediately advance to next step for instant response
        setCurrentStepId(nextStepId);
        setOnboardingState((prev) =>
          prev
            ? {
                ...prev,
                currentStep: nextStepId,
                completedSteps: updatedCompleted,
              }
            : null
        );

        // Asynchronously persist in background
        updateOnboardingProgress(eventId, {
          currentStep: nextStepId,
          completedSteps: updatedCompleted,
        }).catch((err) => {
          console.error("Failed to update onboarding progress in background:", err);
        });
      } else if (activeStepDef.journey === "workspace") {
        const currentIndex = WORKSPACE_STEPS_ORDER.indexOf(currentStepId);

        // If at the end of workspace journey (Step 4: workspace_management)
        if (currentIndex === WORKSPACE_STEPS_ORDER.length - 1) {
          const updatedCompleted = Array.from(
            new Set([...(onboardingState?.completedSteps || []), currentStepId])
          );

          // Immediately close the tour and show completion dialog
          setIsActive(false);
          setCurrentStepId(null);
          setIsCompletionModalOpen(true);
          setOnboardingState((prev) =>
            prev
              ? {
                  ...prev,
                  status: "completed",
                  currentStep: "journey_completed",
                  completedSteps: updatedCompleted,
                }
              : null
          );

          // Clean up the URL query parameter immediately so the tour never reappears
          router.replace(`/org/events/${eventId}`);

          // Asynchronously persist completion in background
          completeOnboarding(eventId).catch((err) => {
            console.error("Failed to complete onboarding in background:", err);
          });

          return;
        }

        const nextStepId = WORKSPACE_STEPS_ORDER[currentIndex + 1];
        const updatedCompleted = Array.from(
          new Set([...(onboardingState?.completedSteps || []), currentStepId])
        );

        // Immediately advance to next step for instant response
        setCurrentStepId(nextStepId);
        setOnboardingState((prev) =>
          prev
            ? {
                ...prev,
                currentStep: nextStepId,
                completedSteps: updatedCompleted,
              }
            : null
        );

        // Asynchronously persist in background
        updateOnboardingProgress(eventId, {
          currentStep: nextStepId,
          completedSteps: updatedCompleted,
        }).catch((err) => {
          console.error("Failed to update onboarding progress in background:", err);
        });
      }
    } catch (err) {
      console.error("Error advancing onboarding step:", err);
    }
  }, [eventId, currentStepId, activeStepDef, onboardingState, router]);

  // Step reversal - optimistic & immediate response
  const prevStep = useCallback(() => {
    if (!currentStepId || !activeStepDef || !eventId) return;

    if (activeStepDef.journey === "builder") {
      const currentIndex = BUILDER_STEPS_ORDER.indexOf(currentStepId);
      if (currentIndex > 0) {
        const prevStepId = BUILDER_STEPS_ORDER[currentIndex - 1];
        setCurrentStepId(prevStepId);
        setOnboardingState((prev) =>
          prev ? { ...prev, currentStep: prevStepId } : null
        );
        updateOnboardingProgress(eventId, { currentStep: prevStepId }).catch(console.error);
      }
    } else if (activeStepDef.journey === "workspace") {
      const currentIndex = WORKSPACE_STEPS_ORDER.indexOf(currentStepId);
      if (currentIndex > 0) {
        const prevStepId = WORKSPACE_STEPS_ORDER[currentIndex - 1];
        setCurrentStepId(prevStepId);
        setOnboardingState((prev) =>
          prev ? { ...prev, currentStep: prevStepId } : null
        );
        updateOnboardingProgress(eventId, { currentStep: prevStepId }).catch(console.error);
      } else {
        // Navigate back to form builder if going back from workspace_review
        router.push(`/org/events/${eventId}/form?onboarding=1`);
        setCurrentStepId("form_save");
      }
    }
  }, [currentStepId, activeStepDef, eventId, router]);

  // Skip / dismiss tour
  const skipTour = useCallback(async () => {
    if (!eventId) return;
    setIsActive(false);
    setCurrentStepId(null);
    if (searchParams.get("onboarding")) {
      router.replace(pathname);
    }
    try {
      await dismissOnboarding(eventId);
    } catch (err) {
      console.error("Error skipping onboarding:", err);
    }
  }, [eventId, pathname, router, searchParams]);

  const exitTour = skipTour;

  // Completion modal close handler - cleans up state and URL
  const handleCloseCompletion = useCallback(() => {
    setIsCompletionModalOpen(false);
    setIsActive(false);
    setCurrentStepId(null);
    if (eventId) {
      router.replace(`/org/events/${eventId}`);
    }
  }, [eventId, router]);

  // Replay tour (developer/QA & user on-demand restart)
  const replayTour = useCallback(async () => {
    if (!eventId) return;
    try {
      await resetOnboarding(eventId);
      router.push(`/org/events/${eventId}/form?onboarding=1`);
      setIsActive(true);
      setCurrentStepId("form_intro");
      setIsCompletionModalOpen(false);
    } catch (err) {
      console.error("Error replaying onboarding tour:", err);
    }
  }, [eventId, router]);

  // Handle form saved for the first time during onboarding
  const handleFormSaved = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const updatedCompleted = Array.from(
        new Set([
          ...(onboardingState?.completedSteps || []),
          "form_save" as OnboardingStepId,
          "form_building" as OnboardingStepId,
        ])
      );

      await updateOnboardingProgress(eventId, {
        currentStep: "workspace_review",
        completedSteps: updatedCompleted,
        isSaved: true,
        waitingForFirstSave: false,
      });

      // Transition to Journey B (Event Workspace)
      router.push(`/org/events/${eventId}?onboarding=1`);
      setCurrentStepId("workspace_review");
      setIsActive(true);
    } catch (err) {
      console.error("Error transitioning to Journey B after form save:", err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, onboardingState, router]);

  const isWaitingForFormSave =
    onboardingState?.status === "in_progress" &&
    (currentStepId === "form_building" ||
      onboardingState?.waitingForFirstSave === true ||
      onboardingState?.currentStep === "form_building");

  // Dynamic context for current step
  const dynamicContext: StepDynamicContext = React.useMemo(() => {
    return {
      eventName: eventData?.name || "Event",
      eventSlug: eventData?.slug || "",
      eventType: eventData?.eventType || "FREE",
      eventStatus: eventData?.status || "DRAFT",
    };
  }, [eventData]);

  const isFirstStep =
    currentStepId === "form_intro" ||
    (isWorkspacePage && currentStepId === "workspace_review");

  const isLastStep =
    currentStepId === "workspace_management" ||
    (isFormBuilderPage && currentStepId === "form_save");

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStepId,
        onboardingState,
        isWaitingForFormSave,
        handleFormSaved,
        replayTour,
        nextStep,
        prevStep,
        skipTour,
        exitTour,
      }}
    >
      {/* Screen reader live announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {children}

      {/* Interactive spotlight & contextual popover */}
      {isActive && activeStepDef && (
        <>
          <TourSpotlight targetRect={targetRect} />
          <TourPopover
            targetRect={targetRect}
            step={activeStepDef}
            context={dynamicContext}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipTour}
            onExit={exitTour}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Completion Modal */}
      <TourCompletionDialog
        isOpen={isCompletionModalOpen}
        onClose={handleCloseCompletion}
        eventId={eventId || ""}
        eventSlug={eventData?.slug}
        eventStatus={eventData?.status}
      />
    </OnboardingContext.Provider>
  );
}
