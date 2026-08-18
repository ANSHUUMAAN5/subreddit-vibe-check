"use client";

import type { ApiErrorBody } from "@/types/reddit";

const MESSAGES: Record<ApiErrorBody["code"], string> = {
  not_found: "That subreddit doesn't exist, or the name isn't valid.",
  private: "That subreddit is private or quarantined — can't read the room in there.",
  banned: "That subreddit has been banned.",
  rate_limited: "Reddit is rate-limiting us right now. Give it a few seconds and retry.",
  unknown: "Something went wrong reaching Reddit. Try again.",
};

export default function ErrorState({ error, subreddit }: { error: ApiErrorBody; subreddit: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border hairline bg-ink-raised py-20 text-center">
      <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-coral">
        Signal Lost
      </span>
      <p className="max-w-sm text-sm text-paper-dim">
        <span className="text-paper">r/{subreddit}</span> — {MESSAGES[error.code]}
      </p>
    </div>
  );
}
