import { describe, it, expect } from "vitest";
import { FEEDS, getFeedsForTopics } from "../src/lib/feeds";

describe("feeds", () => {
  it("has feeds for major topics", () => {
    const domains = [...new Set(FEEDS.map((f) => f.domain))];
    expect(domains).toContain("AI");
    expect(domains).toContain("Business Strategy");
  });

  it("filters feeds by topics", () => {
    const result = getFeedsForTopics(["AI"]);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((f) => f.domain === "AI")).toBe(true);
  });

  it("returns empty for unknown topics", () => {
    const result = getFeedsForTopics(["Underwater Basket Weaving"]);
    expect(result).toHaveLength(0);
  });
});
