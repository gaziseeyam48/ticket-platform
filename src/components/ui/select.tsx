"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  indicatorColor?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  name?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  icon,
  size = "md",
  className,
  triggerClassName,
  menuClassName,
  disabled = false,
  name,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-xs rounded-xl",
    md: "h-10 px-3.5 text-xs sm:text-sm rounded-xl",
    lg: "h-11 px-4 text-sm rounded-xl",
  };

  return (
    <div className={cn("relative w-full space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs sm:text-[13px] font-semibold text-[#171923] tracking-tight">
          {label}
        </label>
      )}

      {/* Hidden input for form serialization */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 font-medium text-[#171923] select-none",
          "border border-[#DCE1E8] bg-[#F8FAFC]",
          "shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)]",
          "hover:border-[#B4BDC9] hover:bg-white",
          "focus-visible:outline-none focus-visible:border-[#171923] focus-visible:ring-3 focus-visible:ring-[#171923]/10 focus-visible:bg-white",
          "transition-all duration-150 ease-out cursor-pointer",
          sizeClasses[size],
          isOpen && "border-[#171923] bg-white ring-3 ring-[#171923]/10 shadow-[0_2px_8px_rgba(23,25,35,0.06)]",
          disabled && "cursor-not-allowed opacity-60 bg-[#F1F4F8] hover:bg-[#F1F4F8] hover:border-[#DCE1E8]",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#667085] shrink-0">{icon}</span>}
          {selectedOption?.indicatorColor && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.indicatorColor }}
            />
          )}
          <span className={cn("truncate", !selectedOption && "text-[#8C96A5]")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1 text-[#667085]">
          {selectedOption?.badge !== undefined && (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F1F4F8] text-[#525B6B] border border-[#DCE1E8]">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200 text-[#667085]",
              isOpen && "rotate-180 text-[#171923]"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            "absolute z-50 w-full min-w-[180px] mt-1.5 py-1.5 rounded-xl border border-[#DCE1E8] bg-white",
            "shadow-[0_10px_25px_-5px_rgba(23,25,35,0.12),0_8px_10px_-6px_rgba(23,25,35,0.06)]",
            "animate-in fade-in-0 zoom-in-95 duration-150 origin-top max-h-60 overflow-y-auto select-none",
            menuClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex items-center justify-between px-3 py-2 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer mx-1 rounded-lg",
                  isSelected
                    ? "bg-[#F1F4F8] text-[#171923] font-semibold"
                    : "text-[#525B6B] hover:text-[#171923] hover:bg-[#F8FAFC]"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className={cn("shrink-0", isSelected ? "text-[#171923]" : "text-[#667085]")}>
                      {option.icon}
                    </span>
                  )}
                  {option.indicatorColor && (
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: option.indicatorColor }}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {option.badge !== undefined && (
                    <span className="text-[11px] font-mono text-[#667085]">
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#087F5B] stroke-[2.5]" aria-hidden="true" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * NativeSelect: A styled HTML select with a custom chevron indicator and sculpted surface,
 * ideal for pure HTML forms and server actions.
 */
export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 group">
        {label && (
          <label htmlFor={id} className="block text-xs sm:text-[13px] font-semibold text-[#171923] tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={id}
            ref={ref}
            className={cn(
              "appearance-none w-full h-10.5 rounded-xl border border-[#DCE1E8] bg-[#F8FAFC] pl-3.5 pr-10 py-2 text-sm font-medium text-[#171923]",
              "shadow-[inset_0_1px_1px_rgba(0,0,0,0.03),0_1px_2px_rgba(23,25,35,0.03)]",
              "hover:border-[#B4BDC9] hover:bg-white",
              "focus-visible:outline-none focus-visible:border-[#171923] focus-visible:ring-3 focus-visible:ring-[#171923]/10 focus-visible:bg-white",
              "focus-visible:shadow-[0_2px_8px_rgba(23,25,35,0.06)]",
              "transition-all duration-150 ease-out cursor-pointer",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[#F1F4F8]",
              error && "border-[#C2415D] bg-[#FFF8F8]/70 text-[#171923] focus-visible:border-[#C2415D]",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 pointer-events-none text-[#667085] group-focus-within:text-[#171923] transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
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

NativeSelect.displayName = "NativeSelect";
