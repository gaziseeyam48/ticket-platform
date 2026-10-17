import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, hint, id, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 group">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={id}
              className="block text-xs sm:text-[13px] font-semibold text-[#171923] tracking-tight transition-colors group-focus-within:text-[#171923]"
            >
              {label}
            </label>
            {hint && (
              <span className="text-[11px] text-[#667085] font-normal">
                {hint}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-[#667085] group-focus-within:text-[#171923] transition-colors flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            className={cn(
              "flex h-10.5 w-full rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] px-3.5 py-2 text-sm font-medium text-[#171923]",
              "placeholder:text-[#8C96A5] placeholder:font-normal",
              "shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)]",
              "hover:border-[#B4BDC9] hover:bg-white",
              "focus-visible:outline-none focus-visible:border-[#171923] focus-visible:ring-3 focus-visible:ring-[#171923]/10 focus-visible:bg-white",
              "focus-visible:shadow-[0_2px_8px_rgba(23,25,35,0.06)]",
              "transition-all duration-150 ease-out",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[#F1F4F8] disabled:border-[#E2E8F0] disabled:shadow-none",
              icon && "pl-10.5",
              error && "border-[#C2415D] bg-[#FFF8F8]/70 text-[#171923] focus-visible:border-[#C2415D] focus-visible:ring-[#C2415D]/15",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[#C2415D] font-medium flex items-center gap-1.5 mt-1">
            <span className="h-1 w-1 rounded-full bg-[#C2415D] shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
