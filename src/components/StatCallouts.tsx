"use client";

import type { VibeSummary } from "@/lib/sentiment";

function Callout({
  title,
  result,
  accent,
}: {
  title: string;
  result: VibeSummary["mostPositive"];
  accent: "phosphor" | "coral";
}) {
  const colorVar = accent === "phosphor" ? "var(--phosphor)" : "var(--coral)";
  return (
    <div
      className="flex flex-col gap-2 rounded-md border hairline bg-ink-raised p-4"
      style={{ borderLeftColor: colorVar, borderLeftWidth: 3 }}
    >
      <span
        className="font-mono text-[10px] tracking-[0.25em] uppercase"
        style={{ color: colorVar }}
      >
        {title}
      </span>
      {result ? (
        <a
          href={result.post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm leading-snug text-paper hover:underline"
        >
          {result.post.title}
        </a>
      ) : (
        <span className="text-sm text-paper-dimmer">No standout post</span>
      )}
      {result && (
        <span className="font-mono text-[11px] text-paper-dimmer">
          score {result.score > 0 ? `+${result.score}` : result.score} · u/{result.post.author}
        </span>
      )}
    </div>
  );
}

export default function StatCallouts({ summary }: { summary: VibeSummary }) {
  return (
    <div className="flex flex-col gap-3">
      <Callout title="Most Positive" result={summary.mostPositive} accent="phosphor" />
      <Callout title="Most Negative" result={summary.mostNegative} accent="coral" />
    </div>
  );
}
