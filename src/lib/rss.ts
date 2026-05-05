import Parser from "rss-parser";
import type { FeedSource } from "./feeds";

const parser = new Parser({ timeout: 10000 });

export interface RawArticle {
  title: string;
  url: string;
  source: string;
  domain: string;
  published_at: string | null;
  tier: number;
}

export async function fetchFeed(feed: FeedSource): Promise<RawArticle[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items || []).slice(0, 20).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "",
      source: feed.name,
      domain: feed.domain,
      published_at: item.isoDate || null,
      tier: feed.tier,
    })).filter((a) => a.url);
  } catch {
    console.error(`Failed to fetch ${feed.name}: ${feed.url}`);
    return [];
  }
}

export async function fetchAllFeeds(feeds: FeedSource[]): Promise<RawArticle[]> {
  const results = await Promise.allSettled(feeds.map(fetchFeed));
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<RawArticle[]>).value);
}
