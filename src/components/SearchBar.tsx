"use client";

import { useState, type FormEvent } from "react";

const QUICK_PICKS = ["technology", "worldnews", "wallstreetbets", "aww", "gaming", "movies"];

interface SearchBarProps {
  onSubmit: (subreddit: string) => void;
  loading: boolean;
  currentSubreddit: string | null;
}

export default function SearchBar({ onSubmit, loading, currentSubreddit }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col items-stretch gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-md border hairline bg-ink-raised px-4 py-3 focus-within:border-accent/60 transition-colors">
          <span className="font-mono text-accent text-sm select-none">r/</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="technology"
            className="flex-1 bg-transparent font-mono text-sm text-paper placeholder:text-paper-dimmer outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="h-4 w-[2px] bg-accent animate-blink" />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="whitespace-nowrap rounded-md border hairline-strong bg-accent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Scanning…" : "Check Vibe"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-paper-dimmer">quick picks:</span>
        {QUICK_PICKS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onSubmit(name)}
            disabled={loading}
            className={`rounded-full border hairline px-3 py-1 font-mono text-[11px] transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40 ${
              currentSubreddit === name ? "border-accent/60 text-accent" : "text-paper-dim"
            }`}
          >
            r/{name}
          </button>
        ))}
      </div>
    </div>
  );
}
