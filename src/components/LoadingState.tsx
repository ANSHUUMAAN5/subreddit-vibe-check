"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function LoadingState() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bars = containerRef.current?.querySelectorAll("[data-scan-bar]");
      if (!bars) return;
      gsap.to(bars, {
        scaleY: 0.3,
        duration: 0.5,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.08, repeat: -1 },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center gap-6 py-24">
      <div className="flex items-end gap-1.5 h-16">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            data-scan-bar
            className="w-1.5 h-full origin-bottom rounded-sm bg-phosphor/70"
          />
        ))}
      </div>
      <p className="font-mono text-xs tracking-[0.3em] uppercase text-paper-dimmer">
        Reading the room…
      </p>
    </div>
  );
}
