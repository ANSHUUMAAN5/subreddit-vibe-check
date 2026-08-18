export interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  numComments: number;
  permalink: string;
  url: string;
  createdUtc: number;
  thumbnail: string | null;
  subreddit: string;
  isSelf: boolean;
  over18: boolean;
}

export interface SentimentResult {
  post: RedditPost;
  score: number;
  comparative: number;
  label: "positive" | "neutral" | "negative";
  positiveWords: string[];
  negativeWords: string[];
}

export interface VibeCheckResponse {
  subreddit: string;
  fetchedAt: number;
  posts: RedditPost[];
  source: "oauth" | "public" | "demo";
}

export interface ApiErrorBody {
  error: string;
  code: "not_found" | "private" | "banned" | "rate_limited" | "unknown";
}
