import Sentiment from "sentiment";
import type { RedditPost, SentimentResult } from "@/types/reddit";

const analyzer = new Sentiment();

const NEUTRAL_BAND = 0; // raw AFINN score of exactly 0 is neutral; any nonzero leans

export function analyzeTitles(posts: RedditPost[]): SentimentResult[] {
  return posts.map((post) => {
    const result = analyzer.analyze(post.title);
    const label: SentimentResult["label"] =
      result.score > NEUTRAL_BAND ? "positive" : result.score < NEUTRAL_BAND ? "negative" : "neutral";

    return {
      post,
      score: result.score,
      comparative: result.comparative,
      label,
      positiveWords: result.positive,
      negativeWords: result.negative,
    };
  });
}

export interface VibeSummary {
  vibeScore: number; // 0-100, 50 = perfectly neutral
  label: "very positive" | "positive" | "neutral" | "negative" | "very negative";
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  total: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  mostPositive: SentimentResult | null;
  mostNegative: SentimentResult | null;
  averageComparative: number;
}

function vibeLabel(score: number): VibeSummary["label"] {
  if (score >= 70) return "very positive";
  if (score >= 55) return "positive";
  if (score > 45) return "neutral";
  if (score > 30) return "negative";
  return "very negative";
}

export function summarizeVibe(results: SentimentResult[]): VibeSummary {
  const total = results.length;
  const positiveCount = results.filter((r) => r.label === "positive").length;
  const negativeCount = results.filter((r) => r.label === "negative").length;
  const neutralCount = total - positiveCount - negativeCount;

  const averageComparative = total
    ? results.reduce((sum, r) => sum + r.comparative, 0) / total
    : 0;

  // Squash unbounded comparative average into a 0-100 vibe score centred on 50.
  const vibeScore = Math.round(50 + 50 * Math.tanh(averageComparative * 6));

  const sorted = [...results].sort((a, b) => b.score - a.score || b.comparative - a.comparative);
  const mostPositive = total ? sorted[0] : null;
  const mostNegative = total ? sorted[sorted.length - 1] : null;

  return {
    vibeScore: Math.max(0, Math.min(100, vibeScore)),
    label: vibeLabel(vibeScore),
    positiveCount,
    neutralCount,
    negativeCount,
    total,
    positivePct: total ? Math.round((positiveCount / total) * 100) : 0,
    neutralPct: total ? Math.round((neutralCount / total) * 100) : 0,
    negativePct: total ? Math.round((negativeCount / total) * 100) : 0,
    mostPositive,
    mostNegative,
    averageComparative,
  };
}
