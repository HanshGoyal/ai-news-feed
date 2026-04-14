import { describe, it, expect } from "vitest";
import { fetchAllRSSFeeds } from "./rssFetcher";

describe("RSS Fetcher", () => {
  it("should fetch all RSS feeds and return array", async () => {
    const items = await fetchAllRSSFeeds();
    expect(Array.isArray(items)).toBe(true);
  });

  it("should return feed items with required fields", async () => {
    const items = await fetchAllRSSFeeds();
    if (items.length > 0) {
      const item = items[0];
      expect(item.title).toBeDefined();
      expect(item.url).toBeDefined();
      expect(item.source).toBeDefined();
      expect(item.type).toBe("article");
      expect(item.publishedAt).toBeInstanceOf(Date);
    }
  });
});
