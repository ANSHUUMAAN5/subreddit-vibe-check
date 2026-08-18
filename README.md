# The Subreddit Vibe Check

**Live:** [subreddit-vibe-check-one.vercel.app](https://subreddit-vibe-check-one.vercel.app)

Point it at any subreddit and it reads the emotional temperature of the top 50
"Hot" posts right now — scored, sorted, and rendered live in the browser.

## What it does

1. **Fetch** — a server route (`/api/reddit`) fetches the top 50 hot posts from
   `/r/{subreddit}/hot`, avoiding the browser's CORS restriction on
   `reddit.com`.
2. **Analyze** — the client runs every post title through the
   [`sentiment`](https://www.npmjs.com/package/sentiment) library (AFINN-based
   lexical scoring), entirely in the browser, per the assignment's "client-side
   sentiment analysis" requirement.
3. **Display** — an animated gauge shows the aggregate 0–100 "vibe score,"
   a distribution bar shows the positive/neutral/negative split, posts are
   ranked with per-post sentiment tags, and the most positive/negative posts
   are called out.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** for styling
- **GSAP** (+ `@gsap/react`) for the gauge sweep, count-up, and staggered
  reveal animations
- **sentiment** for AFINN-based sentiment scoring
- Deployed on **Vercel**

## Reddit API resilience

Reddit aggressively rate-limits and sometimes outright blocks unauthenticated
requests from datacenter IPs (which is what any serverless host uses). To stay
reliable, `/api/reddit` tries three tiers in order:

1. **OAuth** (`oauth.reddit.com`) — used automatically if `REDDIT_CLIENT_ID`
   and `REDDIT_CLIENT_SECRET` are set (see `.env.example`). This is the most
   reliable path.
2. **`api.reddit.com`** — a public endpoint that's sometimes less aggressively
   blocked than the one below.
3. **`www.reddit.com/.../hot.json`** — the plain public JSON endpoint.

Responses are cached in-memory for 2 minutes per subreddit to cut down on
repeat requests.

If **all three** fail (e.g. Reddit blocks the host outright), the app falls
back to clearly-labelled sample data so the dashboard stays demonstrable
instead of showing a dead error screen. A banner makes it obvious when this
has happened.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

OAuth credentials are optional — copy `.env.example` to `.env.local` and fill
them in if you have a Reddit "script" app (create one at
[old.reddit.com/prefs/apps](https://old.reddit.com/prefs/apps)). Without them,
the app just uses the public endpoints.

## Project structure

```
src/
  app/
    api/reddit/route.ts   # server-side Reddit proxy (avoids CORS + adds resilience)
    page.tsx               # entry point
    layout.tsx             # fonts, metadata
  components/
    VibeCheckApp.tsx        # orchestrator: fetch state machine + layout
    VibeGauge.tsx            # animated SVG gauge
    DistributionBar.tsx      # pos/neu/neg bar
    SearchBar.tsx            # subreddit input + quick picks
    PostList.tsx / PostRow.tsx
    StatCallouts.tsx         # most positive / most negative
    LoadingState.tsx / ErrorState.tsx
  lib/
    reddit.ts               # fetch tiers, OAuth token caching, in-memory cache
    sentiment.ts             # title scoring + aggregate summary
    demo-data.ts              # last-resort sample data
    gsap.ts                   # GSAP + useGSAP setup
  types/reddit.ts            # shared types
```

## Notes

Sentiment is scored with a lexicon-based approach (AFINN word list), not a
trained ML model — it's fast, has zero server cost, and is transparent about
why a title scored the way it did, but it can misread sarcasm, slang, or
domain-specific language. It's a read on tone, not a substitute for reading
the actual posts.
