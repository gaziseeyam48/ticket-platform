import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "violet" | "teal" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#F1F4F8] text-[#525B6B] border-[#DCE1E8]",
    success: "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]",
    warning: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
    danger: "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]",
    info: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
    violet: "bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]",
    teal: "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]",
    outline: "bg-white text-[#171923] border-[#DCE1E8]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
