import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  trendText?: string;
  trendType?: "positive" | "neutral" | "warning";
  subtext?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconColorClass = "text-zinc-700",
  iconBgClass = "bg-zinc-100",
  trendText,
  trendType = "neutral",
  subtext,
  className,
}: MetricCardProps) {
  const trendBadgeClasses = {
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    warning: "bg-amber-50 text-amber-700 border-amber-200/70",
    neutral: "bg-zinc-100 text-zinc-600 border-zinc-200/70",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow duration-150 flex flex-col justify-between space-y-3",
        className
      )}
    >
      {/* Top Header: Icon & Trend Pill */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200/50",
            iconBgClass
          )}
        >
          <Icon className={cn("h-5 w-5", iconColorClass)} />
        </div>

        {trendText && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border",
              trendBadgeClasses[trendType]
            )}
          >
            {trendText}
          </span>
        )}
      </div>

      {/* Metric Content */}
      <div className="space-y-1">
        <p className="text-xs text-zinc-500 font-medium">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-zinc-500 font-normal leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
