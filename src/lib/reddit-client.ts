import type { RedditPost } from "@/types/reddit";

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
  data?: { children?: RawRedditChild[] };
}

export class ClientFetchError extends Error {}

/**
 * Fetches hot posts directly from the visitor's own browser rather than our
 * server. Reddit blocks a lot of datacenter/serverless IPs (including
 * Vercel's) but generally not ordinary residential/office ones, so this
 * sidesteps that block for real visitors. Falls back to the server route
 * (handled by the caller) if this fails for any reason.
 */
export async function fetchHotPostsFromBrowser(subreddit: string): Promise<RedditPost[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=50&raw_json=1`,
    { mode: "cors", credentials: "omit", cache: "no-store" }
  );
  if (!res.ok) throw new ClientFetchError(`status ${res.status}`);

  const json = (await res.json()) as RawRedditListing;
  const children = json?.data?.children;
  if (!Array.isArray(children)) throw new ClientFetchError("unexpected response shape");

  return children
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
