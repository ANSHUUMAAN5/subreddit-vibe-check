"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { analyzeTitles, summarizeVibe, type VibeSummary } from "@/lib/sentiment";
import type { ApiErrorBody, SentimentResult, VibeCheckResponse } from "@/types/reddit";
import SearchBar from "./SearchBar";
import VibeGauge from "./VibeGauge";
import DistributionBar from "./DistributionBar";
import StatCallouts from "./StatCallouts";
import PostList from "./PostList";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

type Status = "idle" | "loading" | "success" | "error";

export default function VibeCheckApp() {
  const [status, setStatus] = useState<Status>("idle");
  const [subreddit, setSubreddit] = useState<string | null>(null);
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [summary, setSummary] = useState<VibeSummary | null>(null);
  const [source, setSource] = useState<"oauth" | "public" | "demo" | null>(null);
  const [error, setError] = useState<ApiErrorBody | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = heroRef.current?.querySelectorAll("[data-hero-item]");
      if (!items) return;
      gsap.fromTo(
        items,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.1 }
      );
    },
    { scope: heroRef }
  );

  async function handleSubmit(name: string) {
    const clean = name.trim().replace(/^\/?r\//i, "");
    setStatus("loading");
    setSubreddit(clean);
    setError(null);

    try {
      const res = await fetch(`/api/reddit?subreddit=${encodeURIComponent(clean)}`);
      const body = await res.json();

      if (!res.ok) {
        setError(body as ApiErrorBody);
        setStatus("error");
        return;
      }

      const data = body as VibeCheckResponse;
      const analyzed = analyzeTitles(data.posts);
      setResults(analyzed);
      setSummary(summarizeVibe(analyzed));
      setSource(data.source);
      setStatus("success");
    } catch {
      setError({ error: "Network error", code: "unknown" });
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-14 sm:px-10">
      <div ref={heroRef} className="flex flex-col gap-4">
        <div data-hero-item className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-phosphor animate-blink" />
          <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-paper-dimmer">
            Live Sentiment Instrument
          </span>
        </div>
        <h1
          data-hero-item
          className="font-display text-4xl italic leading-[1.05] text-paper sm:text-6xl"
        >
          The Subreddit
          <br />
          <span className="text-phosphor">Vibe Check.</span>
        </h1>
        <p data-hero-item className="max-w-lg text-sm text-paper-dim">
          Point it at any subreddit and it reads the emotional temperature of the top 50 hot
          posts right now — scored, sorted, and rendered live in your browser.
        </p>
        <div data-hero-item>
          <SearchBar onSubmit={handleSubmit} loading={status === "loading"} currentSubreddit={subreddit} />
        </div>
      </div>

      {status === "loading" && <LoadingState />}

      {status === "error" && error && subreddit && (
        <ErrorState error={error} subreddit={subreddit} />
      )}

      {status === "success" && summary && subreddit && (
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-center gap-6 rounded-lg border hairline bg-ink-raised/40 p-8 scanlines sm:flex-row sm:justify-between">
            <VibeGauge summary={summary} loading={false} />
            <div className="flex w-full max-w-sm flex-col gap-6">
              <div>
                <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-paper-dimmer">
                  Reading
                </p>
                <p className="font-display text-2xl italic text-paper">r/{subreddit}</p>
                <p className="mt-1 font-mono text-[11px] text-paper-dimmer">
                  {summary.total} posts · via{" "}
                  {source === "oauth" ? "OAuth API" : source === "public" ? "public feed" : "sample data"}
                </p>
              </div>
              <DistributionBar summary={summary} />
            </div>
          </div>

          {source === "demo" && (
            <div className="rounded-md border hairline-strong bg-amber/10 px-4 py-3 font-mono text-[11px] text-amber">
              Reddit&apos;s live feed is unreachable from this server right now (likely rate-limiting),
              so this is illustrative sample data — not r/{subreddit}&apos;s real posts.
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
            <div>
              <p className="mb-2 font-mono text-[11px] tracking-[0.25em] uppercase text-paper-dimmer">
                Hot Posts — Ranked
              </p>
              <PostList results={results} />
            </div>
            <StatCallouts summary={summary} />
          </div>
        </div>
      )}
    </main>
  );
}
