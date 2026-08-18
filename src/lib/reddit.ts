import type { RedditPost } from "@/types/reddit";

const USER_AGENT = "web:subreddit-vibe-check:v1.0.0 (by /u/anonymous)";
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const POST_LIMIT = 50;

class RedditApiError extends Error {
  code: "not_found" | "private" | "banned" | "rate_limited" | "unknown";
  constructor(message: string, code: RedditApiError["code"]) {
    super(message);
    this.code = code;
  }
}

interface CacheEntry {
  posts: RedditPost[];
  source: PostSource;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    cachedToken = null;
    return null;
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000 - 30_000,
  };
  return cachedToken.value;
}

interface RawRedditChild {
  kind: string;
  data: {
    id: string;
    title: string;
    author: string;
    ups: number;
    score: number;
    num_comments: number;
    permalink: string;
    url: string;
    created_utc: number;
    thumbnail: string;
    subreddit: string;
    is_self: boolean;
    over_18: boolean;
  };
}

interface RawRedditListing {
  data: {
    children: RawRedditChild[];
  };
}

function normalizePosts(listing: RawRedditListing): RedditPost[] {
  return listing.data.children
    .filter((c) => c.kind === "t3")
    .map((c) => {
      const d = c.data;
      const thumb = d.thumbnail && d.thumbnail.startsWith("http") ? d.thumbnail : null;
      return {
        id: d.id,
        title: d.title,
        author: d.author,
        score: d.score ?? d.ups ?? 0,
        numComments: d.num_comments ?? 0,
        permalink: `https://www.reddit.com${d.permalink}`,
        url: d.url,
        createdUtc: d.created_utc,
        thumbnail: thumb,
        subreddit: d.subreddit,
        isSelf: d.is_self,
        over18: d.over_18,
      };
    });
}

function mapStatusToError(status: number, viaOAuth: boolean): RedditApiError {
  if (status === 404) return new RedditApiError("Subreddit not found", "not_found");
  if (status === 403) {
    return viaOAuth
      ? new RedditApiError("Subreddit is private or quarantined", "private")
      : new RedditApiError("Reddit blocked this unauthenticated request", "rate_limited");
  }
  if (status === 429) return new RedditApiError("Rate limited by Reddit", "rate_limited");
  return new RedditApiError(`Reddit returned ${status}`, "unknown");
}

async function fetchViaOAuth(subreddit: string, token: string): Promise<RedditPost[]> {
  const res = await fetch(
    `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/hot?limit=${POST_LIMIT}&raw_json=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": USER_AGENT,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) throw mapStatusToError(res.status, true);
  const json = (await res.json()) as RawRedditListing;
  return normalizePosts(json);
}

async function fetchViaApiReddit(subreddit: string): Promise<RedditPost[]> {
  const res = await fetch(
    `https://api.reddit.com/r/${encodeURIComponent(subreddit)}/hot?limit=${POST_LIMIT}&raw_json=1`,
    {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    }
  );
  if (!res.ok) throw mapStatusToError(res.status, false);
  const json = (await res.json()) as RawRedditListing;
  return normalizePosts(json);
}

async function fetchViaPublicJson(subreddit: string): Promise<RedditPost[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=${POST_LIMIT}&raw_json=1`,
    {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    }
  );
  if (!res.ok) throw mapStatusToError(res.status, false);
  const json = (await res.json()) as RawRedditListing;
  return normalizePosts(json);
}

export type PostSource = "oauth" | "public" | "demo";

export async function fetchHotPosts(
  subredditRaw: string
): Promise<{ posts: RedditPost[]; source: PostSource }> {
  const subreddit = subredditRaw.trim().replace(/^\/?r\//i, "").replace(/\/$/, "");
  if (!/^[a-zA-Z0-9_]{2,21}$/.test(subreddit)) {
    throw new RedditApiError("Invalid subreddit name", "not_found");
  }

  const cacheKey = subreddit.toLowerCase();
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { posts: cached.posts, source: cached.source };
  }

  const tiers: Array<{ source: PostSource; run: () => Promise<RedditPost[]> }> = [];

  const token = await getAccessToken();
  if (token) {
    tiers.push({ source: "oauth", run: () => fetchViaOAuth(subreddit, token) });
  }
  tiers.push({ source: "public", run: () => fetchViaApiReddit(subreddit) });
  tiers.push({ source: "public", run: () => fetchViaPublicJson(subreddit) });

  let lastError: unknown = null;
  for (const tier of tiers) {
    try {
      const posts = await tier.run();
      responseCache.set(cacheKey, { posts, source: tier.source, expiresAt: Date.now() + CACHE_TTL_MS });
      return { posts, source: tier.source };
    } catch (err) {
      // A definitive "not found" means the subreddit itself doesn't exist —
      // no fallback tier will change that, so fail fast instead of masking
      // a genuine typo with sample data.
      if (err instanceof RedditApiError && err.code === "not_found") throw err;
      lastError = err;
    }
  }

  // Every live tier failed (near-certainly Reddit blocking this server's IP,
  // common for datacenter hosts without OAuth creds). Fall back to clearly
  // labelled sample data so the deployed dashboard stays demonstrable.
  const { buildDemoPosts } = await import("./demo-data");
  const posts = buildDemoPosts(subreddit);
  void lastError;
  return { posts, source: "demo" };
}

export { RedditApiError };
