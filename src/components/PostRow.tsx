"use client";

import type { SentimentResult } from "@/types/reddit";

const LABEL_STYLES: Record<SentimentResult["label"], { dot: string; text: string; tag: string }> = {
  positive: { dot: "bg-phosphor", text: "text-phosphor", tag: "POS" },
  neutral: { dot: "bg-paper-dimmer", text: "text-paper-dim", tag: "NEU" },
  negative: { dot: "bg-coral", text: "text-coral", tag: "NEG" },
};

function timeAgo(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PostRow({ result, rank }: { result: SentimentResult; rank: number }) {
  const style = LABEL_STYLES[result.label];
  return (
    <a
      href={result.post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      data-post-row
      className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b hairline px-1 py-3 transition-colors hover:bg-ink-raised"
    >
      <span className="font-mono text-xs text-paper-dimmer tabular-nums">
        {String(rank).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[14px] text-paper group-hover:text-phosphor transition-colors">
          {result.post.title}
        </p>
        <p className="mt-1 flex items-center gap-3 font-mono text-[11px] text-paper-dimmer">
          <span>▲ {result.post.score}</span>
          <span>{result.post.numComments} comments</span>
          <span>{timeAgo(result.post.createdUtc)}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        <span className={`font-mono text-[11px] tracking-widest ${style.text}`}>
          {style.tag}
        </span>
        <span className="font-mono text-[11px] text-paper-dimmer w-8 text-right tabular-nums">
          {result.score > 0 ? `+${result.score}` : result.score}
        </span>
      </div>
    </a>
  );
}
