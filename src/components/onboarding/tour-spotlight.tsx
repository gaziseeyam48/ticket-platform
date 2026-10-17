"use client";

import { useEffect, useState } from "react";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourSpotlightProps {
  targetRect: Rect | null;
  padding?: number;
  borderRadius?: number;
}

export function TourSpotlight({
  targetRect,
  padding = 8,
  borderRadius = 16,
}: TourSpotlightProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !targetRect) return null;

  const top = Math.max(0, targetRect.top - padding);
  const left = Math.max(0, targetRect.left - padding);
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-all duration-300 ease-in-out motion-reduce:transition-none"
      aria-hidden="true"
    >
      {/* Cutout box with ultra-wide shadow creating the darkened backdrop */}
      <div
        className="absolute rounded-2xl ring-2 ring-[#0284C7] ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] transition-all duration-300 ease-in-out motion-reduce:transition-none"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${borderRadius}px`,
        }}
      />
    </div>
  );
}
