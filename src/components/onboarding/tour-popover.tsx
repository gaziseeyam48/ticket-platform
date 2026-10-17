"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { TourStepDefinition, StepDynamicContext } from "@/lib/onboarding/types";
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourPopoverProps {
  targetRect: Rect | null;
  step: TourStepDefinition;
  context: StepDynamicContext;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onExit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
}

export function TourPopover({
  targetRect,
  step,
  context,
  onNext,
  onBack,
  onSkip,
  onExit,
  isFirstStep,
  isLastStep,
  isLoading = false,
}: TourPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 100,
    left: 24,
  });

  const descriptionText = useMemo(() => {
    if (typeof step.description === "function") {
      return step.description(context);
    }
    return step.description;
  }, [step, context]);

  // Keyboard navigation & accessibility trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      } else if (e.key === "ArrowRight" && !isLoading) {
        // Only if not typing in an input
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          onNext();
        }
      } else if (e.key === "ArrowLeft" && !isFirstStep && !isLoading) {
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          onBack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit, onNext, onBack, isFirstStep, isLoading]);

  // Focus management: focus on the primary action when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [step.id]);

  // Positioning calculations with viewport collision avoidance
  useEffect(() => {
    if (!popoverRef.current) return;

    const popoverEl = popoverRef.current;
    const popoverRect = popoverEl.getBoundingClientRect();
    const width = popoverRect.width || 360;
    const height = popoverRect.height || 220;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!targetRect) {
      // Fallback: floating bottom-right or center if target not visible
      setCoords({
        top: Math.max(20, viewportHeight - height - 32),
        left: Math.max(16, Math.min(viewportWidth - width - 24, viewportWidth / 2 - width / 2)),
      });
      return;
    }

    const margin = 14;
    const preferredPlacement = step.placement || "bottom";

    let calculatedTop = 0;
    let calculatedLeft = 0;

    if (preferredPlacement === "bottom") {
      calculatedTop = targetRect.top + targetRect.height + margin;
      calculatedLeft = targetRect.left + (targetRect.width / 2) - (width / 2);

      // Flip to top if overflowing bottom of viewport
      if (calculatedTop + height > viewportHeight - 16) {
        calculatedTop = targetRect.top - height - margin;
      }
    } else if (preferredPlacement === "top") {
      calculatedTop = targetRect.top - height - margin;
      calculatedLeft = targetRect.left + (targetRect.width / 2) - (width / 2);

      // Flip to bottom if overflowing top
      if (calculatedTop < 16) {
        calculatedTop = targetRect.top + targetRect.height + margin;
      }
    } else if (preferredPlacement === "right") {
      calculatedLeft = targetRect.left + targetRect.width + margin;
      calculatedTop = targetRect.top + (targetRect.height / 2) - (height / 2);

      // Flip to bottom/top if overflowing right
      if (calculatedLeft + width > viewportWidth - 16) {
        calculatedLeft = targetRect.left + (targetRect.width / 2) - (width / 2);
        calculatedTop = targetRect.top + targetRect.height + margin;
      }
    } else if (preferredPlacement === "left") {
      calculatedLeft = targetRect.left - width - margin;
      calculatedTop = targetRect.top + (targetRect.height / 2) - (height / 2);

      // Flip if overflowing left
      if (calculatedLeft < 16) {
        calculatedLeft = targetRect.left + (targetRect.width / 2) - (width / 2);
        calculatedTop = targetRect.top + targetRect.height + margin;
      }
    }

    // Horizontal bounds clamping
    calculatedLeft = Math.max(16, Math.min(viewportWidth - width - 16, calculatedLeft));
    // Vertical bounds clamping
    calculatedTop = Math.max(16, Math.min(viewportHeight - height - 16, calculatedTop));

    setCoords({
      top: calculatedTop,
      left: calculatedLeft,
    });
  }, [targetRect, step.placement, step.id]);

  const journeyLabel =
    step.journey === "builder" ? "Form Setup" : "Event Setup";

  return (
    <aside
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="tour-step-title"
      aria-describedby="tour-step-desc"
      className="fixed z-50 w-[calc(100vw-32px)] sm:w-[400px] rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xl transition-all duration-300 ease-out animate-in fade-in zoom-in-95 motion-reduce:transition-none"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F4F8]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <Sparkles className="h-3 w-3" />
            {journeyLabel} • Step {step.stepNumber} of {step.totalStepsInJourney}
          </span>
        </div>

        <button
          type="button"
          onClick={onExit}
          title="Exit guided walkthrough (Esc)"
          aria-label="Exit guided walkthrough"
          className="p-1 rounded-lg text-[#525B6B] hover:text-[#171923] hover:bg-[#F1F4F8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="py-3.5 space-y-2">
        <h2
          id="tour-step-title"
          className="text-base font-bold text-[#171923] tracking-tight leading-snug"
        >
          {step.title}
        </h2>
        <p
          id="tour-step-desc"
          className="text-xs sm:text-sm text-[#525B6B] leading-relaxed"
        >
          {descriptionText}
        </p>
      </div>

      {/* Actions footer */}
      <div className="pt-3 border-t border-[#F1F4F8] flex items-center justify-between gap-2">
        <div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-medium text-[#525B6B] hover:text-[#171923] transition-colors px-1 py-1 rounded focus-visible:outline-none focus-visible:underline cursor-pointer"
          >
            Skip tour
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#525B6B] hover:text-[#171923] bg-[#F8FAFC] border border-[#DCE1E8] rounded-xl hover:bg-[#F1F4F8] transition-all disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          )}

          <button
            ref={nextButtonRef}
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 cursor-pointer"
          >
            {isLastStep ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{step.primaryActionLabel || "Complete"}</span>
              </>
            ) : (
              <>
                <span>{step.primaryActionLabel || "Next"}</span>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
