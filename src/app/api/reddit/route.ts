import { NextRequest, NextResponse } from "next/server";
import { fetchHotPosts, RedditApiError } from "@/lib/reddit";
import type { ApiErrorBody, VibeCheckResponse } from "@/types/reddit";

export async function GET(request: NextRequest) {
  const subreddit = request.nextUrl.searchParams.get("subreddit");

  if (!subreddit) {
    const body: ApiErrorBody = { error: "Missing subreddit parameter", code: "not_found" };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const { posts, source } = await fetchHotPosts(subreddit);
    const body: VibeCheckResponse = {
      subreddit,
      fetchedAt: Date.now(),
      posts,
      source,
    };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (err) {
    if (err instanceof RedditApiError) {
      const status =
        err.code === "not_found" ? 404 : err.code === "rate_limited" ? 429 : err.code === "private" ? 403 : 502;
      const body: ApiErrorBody = { error: err.message, code: err.code };
      return NextResponse.json(body, { status });
    }
    const body: ApiErrorBody = { error: "Unexpected error reaching Reddit", code: "unknown" };
    return NextResponse.json(body, { status: 502 });
  }
}
