import Parser from "rss-parser";
import { InsertFeedItem } from "../../drizzle/schema";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "content"],
      ["media:thumbnail", "thumbnail"],
    ],
  },
});

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  type: "article";
}

const RSS_SOURCES: RSSSource[] = [
  {
    id: "tds",
    name: "Towards Data Science",
    url: "https://towardsdatascience.com/feed",
    type: "article",
  },
  {
    id: "arxiv",
    name: "arXiv cs.AI",
    url: "https://rss.arxiv.org/rss/cs.AI",
    type: "article",
  },
  {
    id: "deeplearning",
    name: "DeepLearning.AI The Batch",
    url: "https://www.deeplearning.ai/the-batch/feed/",
    type: "article",
  },
];

export async function fetchRSSFeed(source: RSSSource): Promise<InsertFeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const items: InsertFeedItem[] = [];

    for (const item of feed.items.slice(0, 20)) {
      // Limit to 20 items per feed
      if (!item.link || !item.title) continue;

      const sourceId = `${source.id}-${item.guid || item.link}`;
      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

      items.push({
        sourceId,
        type: "article",
        source: source.id,
        title: item.title,
        description: item.contentSnippet || (item as any).summary || "",
        content: (item as any).content || (item as any).description || "",
        author: item.creator || (item as any).author || "",
        url: item.link,
        publishedAt,
        imageUrl: (item as any).thumbnail?.url || "",
        tags: item.categories ? JSON.stringify(item.categories) : null,
        metrics: null,
      });
    }

    return items;
  } catch (error) {
    console.error(`[RSS Fetcher] Error fetching ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllRSSFeeds(): Promise<InsertFeedItem[]> {
  const allItems: InsertFeedItem[] = [];

  for (const source of RSS_SOURCES) {
    const items = await fetchRSSFeed(source);
    allItems.push(...items);
  }

  return allItems;
}
