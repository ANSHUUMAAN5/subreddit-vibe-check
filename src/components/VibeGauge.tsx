"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { VibeSummary } from "@/lib/sentiment";

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 128;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SWEEP_DEG = 300; // gauge covers 300deg, leaving a 60deg gap at the bottom
const TRACK_LENGTH = (SWEEP_DEG / 360) * CIRCUMFERENCE;
const ROTATION = 120; // rotates the dasharray start so the gap centers at the bottom

function zoneColor(score: number): string {
  if (score >= 60) return "var(--phosphor)";
  if (score >= 40) return "var(--amber)";
  return "var(--coral)";
}

function polar(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

const TICKS = Array.from({ length: 11 }, (_, i) => {
  const angle = 120 + 60 + (i / 10) * SWEEP_DEG - SWEEP_DEG; // spread evenly across the visible sweep
  return angle;
});

interface VibeGaugeProps {
  summary: VibeSummary | null;
  loading: boolean;
}

export default function VibeGauge({ summary, loading }: VibeGaugeProps) {
  const progressRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!summary || !progressRef.current || !numberRef.current) return;

    const target = summary.vibeScore;
    const color = zoneColor(target);
    const state = { v: 0 };

    gsap.set(progressRef.current, { stroke: color });

    const tl = gsap.timeline();
    tl.to(state, {
      v: target,
      duration: 1.6,
      ease: "power3.out",
      onUpdate: () => {
        const frac = state.v / 100;
        const dash = frac * TRACK_LENGTH;
        progressRef.current?.setAttribute(
          "stroke-dasharray",
          `${dash} ${CIRCUMFERENCE}`
        );
        if (numberRef.current) numberRef.current.textContent = String(Math.round(state.v));
      },
    });

    if (labelRef.current) {
      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );
    }
  }, [summary?.vibeScore]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
      >
        {/* zone track, tri-colour */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--ink-raised-2)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${TRACK_LENGTH} ${CIRCUMFERENCE}`}
          transform={`rotate(${ROTATION} ${CENTER} ${CENTER})`}
        />

        {/* tick marks */}
        {TICKS.map((angle, i) => {
          const outer = polar(angle, RADIUS + 14);
          const inner = polar(angle, RADIUS + 5);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--paper-dimmer)"
              strokeWidth={i % 5 === 0 ? 2 : 1}
              opacity={0.6}
            />
          );
        })}

        {/* animated progress arc */}
        <circle
          ref={progressRef}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--phosphor)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`0 ${CIRCUMFERENCE}`}
          transform={`rotate(${ROTATION} ${CENTER} ${CENTER})`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-[11px] tracking-[0.3em] uppercase text-paper-dimmer">
          Vibe Score
        </span>
        <span
          ref={numberRef}
          className="font-display font-black italic text-[86px] leading-none text-paper tabular-nums"
        >
          {loading ? "—" : 0}
        </span>
        <span
          ref={labelRef}
          className="text-xs tracking-[0.2em] uppercase opacity-0"
          style={{ color: summary ? zoneColor(summary.vibeScore) : "var(--paper-dim)" }}
        >
          {summary ? summary.label : "awaiting input"}
        </span>
      </div>
    </div>
  );
}
