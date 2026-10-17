import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

export type MetricAccent = "blue" | "green" | "violet" | "amber" | "teal" | "neutral";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: MetricAccent;
  iconColorClass?: string;
  iconBgClass?: string;
  trendText?: string;
  trendType?: "positive" | "neutral" | "warning" | "info";
  subtext?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

const ACCENT_STYLES: Record<MetricAccent, { bg: string; text: string; border: string }> = {
  blue: {
    bg: "bg-[#EFF6FF]",
    text: "text-[#1D4ED8]",
    border: "border-[#BFDBFE]",
  },
  green: {
    bg: "bg-[#E6F7F0]",
    text: "text-[#06694A]",
    border: "border-[#A3E6CD]",
  },
  violet: {
    bg: "bg-[#F5F3FF]",
    text: "text-[#5B21B6]",
    border: "border-[#DDD6FE]",
  },
  amber: {
    bg: "bg-[#FFFBEB]",
    text: "text-[#92400E]",
    border: "border-[#FDE68A]",
  },
  teal: {
    bg: "bg-[#F0FDFA]",
    text: "text-[#0F766E]",
    border: "border-[#99F6E4]",
  },
  neutral: {
    bg: "bg-[#F1F4F8]",
    text: "text-[#525B6B]",
    border: "border-[#DCE1E8]",
  },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  iconColorClass,
  iconBgClass,
  trendText,
  trendType = "neutral",
  subtext,
  className,
  href,
  onClick,
}: MetricCardProps) {
  const trendBadgeClasses = {
    positive: "bg-[#E6F7F0] text-[#06694A] border-[#A3E6CD]",
    warning: "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]",
    neutral: "bg-[#F1F4F8] text-[#525B6B] border-[#DCE1E8]",
    info: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  };

  const resolvedAccent = accent
    ? ACCENT_STYLES[accent]
    : {
        bg: iconBgClass || "bg-[#F1F4F8]",
        text: iconColorClass || "text-[#525B6B]",
        border: "border-[#DCE1E8]",
      };

  const isInteractive = Boolean(href || onClick);

  const cardContent = (
    <>
      {/* Top Header: Tinted Icon & Trend Pill */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform",
            isInteractive && "group-hover:scale-105",
            resolvedAccent.bg,
            resolvedAccent.border
          )}
        >
          <Icon className={cn("h-5 w-5", resolvedAccent.text)} />
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
      <div className="space-y-1.5">
        <p className="text-sm text-[#525B6B] font-medium leading-none">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171923]">
          {value}
        </p>
        {subtext && (
          <p className="text-[13px] text-[#667085] font-normal leading-normal">
            {subtext}
          </p>
        )}
      </div>
    </>
  );

  const cardClasses = cn(
    "rounded-2xl border border-[#DCE1E8] bg-white p-5 shadow-2xs transition-all duration-150 flex flex-col justify-between space-y-3 group",
    isInteractive &&
      "hover:border-[#9AA4B2] hover:shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171923] focus-visible:ring-offset-2",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cardClasses, "text-left w-full")}>
        {cardContent}
      </button>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
}
