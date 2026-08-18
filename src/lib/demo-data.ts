import type { RedditPost } from "@/types/reddit";

// Last-resort fallback used only when every live Reddit fetch tier fails
// (OAuth, api.reddit.com, and www.reddit.com public JSON). Keeps the
// dashboard demonstrable instead of showing a dead error screen.
export function buildDemoPosts(subreddit: string): RedditPost[] {
  const templates: Array<{ title: string; score: number; comments: number; author: string }> = [
    { title: "This is genuinely one of the best updates the community has seen all year", score: 12400, comments: 890, author: "demo_user_1" },
    { title: "Absolutely thrilled with how this turned out, incredible work", score: 9800, comments: 654, author: "demo_user_2" },
    { title: "Quarterly numbers released, in line with prior estimates", score: 1200, comments: 88, author: "demo_user_3" },
    { title: "Why is everyone furious about this decision, feels like a disaster", score: 7600, comments: 1420, author: "demo_user_4" },
    { title: "Terrible outage overnight left thousands of users stranded and angry", score: 6100, comments: 980, author: "demo_user_5" },
    { title: "New thread for general discussion this week", score: 340, comments: 45, author: "demo_user_6" },
    { title: "Beautiful design choice, love the direction this is heading", score: 8300, comments: 512, author: "demo_user_7" },
    { title: "Scheduled maintenance planned for next Tuesday", score: 210, comments: 19, author: "demo_user_8" },
    { title: "Devastating news for everyone involved, truly heartbreaking", score: 5400, comments: 1100, author: "demo_user_9" },
    { title: "Solid, reliable release with a handful of minor fixes", score: 980, comments: 62, author: "demo_user_10" },
    { title: "This might be the greatest thing to happen to the community in years", score: 15200, comments: 2040, author: "demo_user_11" },
    { title: "Frustrating bug ruins the experience for a lot of people", score: 4300, comments: 730, author: "demo_user_12" },
  ];

  const now = Math.floor(Date.now() / 1000);
  return templates.map((t, i) => ({
    id: `demo-${i}`,
    title: t.title,
    author: t.author,
    score: t.score,
    numComments: t.comments,
    permalink: `https://www.reddit.com/r/${subreddit}/`,
    url: `https://www.reddit.com/r/${subreddit}/`,
    createdUtc: now - i * 1800,
    thumbnail: null,
    subreddit,
    isSelf: false,
    over18: false,
  }));
}
