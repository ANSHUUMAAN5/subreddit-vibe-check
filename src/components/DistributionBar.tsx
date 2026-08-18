"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { VibeSummary } from "@/lib/sentiment";

interface DistributionBarProps {
  summary: VibeSummary;
}

export default function DistributionBar({ summary }: DistributionBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const segments = containerRef.current?.querySelectorAll("[data-segment]");
      if (!segments) return;
      gsap.fromTo(
        segments,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          transformOrigin: "left center",
        }
      );
    },
    { scope: containerRef, dependencies: [summary.positivePct, summary.negativePct] }
  );

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center justify-between mb-2 text-[11px] tracking-[0.2em] uppercase text-paper-dimmer">
        <span>Distribution · {summary.total} posts</span>
        <span>pos / neu / neg</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-sm border hairline bg-ink-raised">
        {summary.positivePct > 0 && (
          <div
            data-segment
            className="h-full bg-phosphor"
            style={{ width: `${summary.positivePct}%` }}
          />
        )}
        {summary.neutralPct > 0 && (
          <div
            data-segment
            className="h-full bg-paper-dimmer"
            style={{ width: `${summary.neutralPct}%` }}
          />
        )}
        {summary.negativePct > 0 && (
          <div
            data-segment
            className="h-full bg-coral"
            style={{ width: `${summary.negativePct}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-2 font-mono text-xs">
        <span className="text-phosphor">{summary.positivePct}% pos ({summary.positiveCount})</span>
        <span className="text-paper-dim">{summary.neutralPct}% neu ({summary.neutralCount})</span>
        <span className="text-coral">{summary.negativePct}% neg ({summary.negativeCount})</span>
      </div>
    </div>
  );
}
