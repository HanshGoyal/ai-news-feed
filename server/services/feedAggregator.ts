import { upsertFeedItem } from "../db";
import { fetchAllRSSFeeds } from "./rssFetcher";
import { scrapeGitHubTrending, scrapeThereIsAnAIForThat, scrapeEmergentMind, scrapeTechXplore, scrapePapersWithCode } from "./scraper";
import { fetchTwitterFeed, generateTwitterEmbedLinks } from "./twitterFetcher";

export async function aggregateAllFeeds(): Promise<void> {
  try {
    console.log("[Feed Aggregator] Starting feed aggregation...");

    // Fetch from all sources in parallel
    const [rssItems, githubItems, aiToolsItems, emergentMindItems, techxploreItems, pwcItems, twitterItems] = await Promise.all([
      fetchAllRSSFeeds(),
      scrapeGitHubTrending(),
      scrapeThereIsAnAIForThat(),
      scrapeEmergentMind(),
      scrapeTechXplore(),
      scrapePapersWithCode(),
      fetchTwitterFeed().catch(() => generateTwitterEmbedLinks()), // Fallback to embed links if Nitter fails
    ]);

    const allItems = [...rssItems, ...githubItems, ...aiToolsItems, ...emergentMindItems, ...techxploreItems, ...pwcItems, ...twitterItems];

    console.log(`[Feed Aggregator] Fetched ${allItems.length} items from all sources`);

    // Upsert all items into the database
    for (const item of allItems) {
      try {
        await upsertFeedItem(item);
      } catch (error) {
        console.error("[Feed Aggregator] Error upserting item:", error);
      }
    }

    console.log("[Feed Aggregator] Feed aggregation completed successfully");
  } catch (error) {
    console.error("[Feed Aggregator] Error during feed aggregation:", error);
  }
}

export async function startFeedRefreshSchedule(): Promise<void> {
  // Import node-cron dynamically to avoid issues in non-Node environments
  try {
    const cron = await import("node-cron");

    // Run aggregation every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
      console.log("[Feed Aggregator] Running scheduled feed refresh...");
      await aggregateAllFeeds();
    });

    // Also run on startup
    await aggregateAllFeeds();

    console.log("[Feed Aggregator] Feed refresh schedule started (every 30 minutes)");
  } catch (error) {
    console.error("[Feed Aggregator] Error setting up feed refresh schedule:", error);
  }
}
