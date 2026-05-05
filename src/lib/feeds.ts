export interface FeedSource {
  url: string;
  name: string;
  domain: string;
  tier: number; // 1 = highest quality
}

export const FEEDS: FeedSource[] = [
  // AI & Tech
  { url: "https://news.ycombinator.com/rss", name: "Hacker News", domain: "AI", tier: 1 },
  { url: "https://techcrunch.com/feed/", name: "TechCrunch", domain: "AI", tier: 2 },
  { url: "https://www.theverge.com/rss/index.xml", name: "The Verge", domain: "AI", tier: 2 },
  // Business
  { url: "https://hbr.org/resources/rss", name: "HBR", domain: "Business Strategy", tier: 1 },
  { url: "https://review.firstround.com/feed.xml", name: "First Round Review", domain: "Business Strategy", tier: 1 },
  { url: "https://a16z.com/feed/", name: "a16z", domain: "Business Strategy", tier: 1 },
  // Product
  { url: "https://www.lennysnewsletter.com/feed", name: "Lenny's Newsletter", domain: "Product", tier: 1 },
  // Finance
  { url: "https://www.finimize.com/wp/feed/", name: "Finimize", domain: "Finance", tier: 2 },
];

export function getFeedsForTopics(topics: string[]): FeedSource[] {
  return FEEDS.filter((f) => topics.includes(f.domain));
}
