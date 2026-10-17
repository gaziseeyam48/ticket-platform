import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "positive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, disabled, children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer";

    const variants = {
      primary:
        "bg-[#171923] text-white hover:bg-[#252936] active:bg-[#0E1017] focus-visible:ring-[#171923] shadow-xs",
      positive:
        "bg-[#087F5B] text-white hover:bg-[#06694A] active:bg-[#05563D] focus-visible:ring-[#087F5B] shadow-xs",
      secondary:
        "bg-[#F1F4F8] text-[#171923] hover:bg-[#E2E7F0] active:bg-[#D5DCE8] focus-visible:ring-[#717D96] border border-[#DCE1E8]",
      outline:
        "border border-[#DCE1E8] bg-white text-[#171923] hover:bg-[#F7F8FA] active:bg-[#F1F4F8] focus-visible:ring-[#717D96] shadow-xs",
      ghost:
        "text-[#525B6B] hover:text-[#171923] hover:bg-[#F1F4F8] focus-visible:ring-[#717D96]",
      danger:
        "bg-[#C2415D] text-white hover:bg-[#A9324D] active:bg-[#8E283F] focus-visible:ring-[#C2415D] shadow-xs",
    };

    const sizes = {
      sm: "text-xs font-medium px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm font-medium px-4 py-2 h-9 sm:h-10 gap-2",
      lg: "text-base font-medium px-5 py-2.5 h-11 sm:h-12 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
