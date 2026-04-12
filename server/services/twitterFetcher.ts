import axios from "axios";
import { InsertFeedItem } from "../../drizzle/schema";

// Using Nitter proxy for fetching tweets without API key
const NITTER_INSTANCES = [
  "https://nitter.net",
  "https://nitter.1d4.us",
  "https://nitter.kavin.rocks",
];

const TWITTER_ACCOUNTS = [
  "karpathy",
  "ylecun",
  "jeremyphoward",
  "hardmaru",
  "omarsar0",
  "seb_ruder",
  "goodside",
  "emollick",
  "_akhaliq",
  "mreflow",
  "heyBarsee",
  "bilawalsidhu",
];

interface Tweet {
  id: string;
  text: string;
  date: string;
  author: string;
  url: string;
}

export async function fetchTwitterFeed(): Promise<InsertFeedItem[]> {
  const items: InsertFeedItem[] = [];

  for (const account of TWITTER_ACCOUNTS) {
    try {
      const tweets = await fetchAccountTweets(account);
      for (const tweet of tweets.slice(0, 5)) {
        // Limit to 5 tweets per account
        const sourceId = `twitter-${tweet.id}`;

        items.push({
          sourceId,
          type: "tweet",
          source: "twitter",
          title: `@${tweet.author}: ${tweet.text.substring(0, 100)}`,
          description: tweet.text,
          content: tweet.text,
          author: tweet.author,
          url: tweet.url,
          publishedAt: new Date(tweet.date),
          imageUrl: null,
          tags: JSON.stringify(["twitter", "ai", "ml"]),
          metrics: null,
        });
      }
    } catch (error) {
      console.error(`[Twitter Fetcher] Error fetching tweets from @${account}:`, error);
    }
  }

  return items;
}

async function fetchAccountTweets(account: string): Promise<Tweet[]> {
  // Try each Nitter instance until one works
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/${account}/rss`;
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      // Parse RSS feed from Nitter
      const tweets = parseNitterRSS(response.data, account);
      if (tweets.length > 0) {
        return tweets;
      }
    } catch (error) {
      // Try next instance
      continue;
    }
  }

  // Fallback: return empty array if all instances fail
  return [];
}

function parseNitterRSS(rssContent: string, account: string): Tweet[] {
  const tweets: Tweet[] = [];

  try {
    // Simple RSS parsing for Nitter feed
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(rssContent)) !== null) {
      const itemContent = match[1];

      // Extract title
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
      const text = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";

      // Extract link
      const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
      const url = linkMatch ? linkMatch[1].trim() : "";

      // Extract date
      const dateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
      const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

      // Extract ID from URL
      const idMatch = /\/(\d+)$/.exec(url);
      const id = idMatch ? idMatch[1] : `${account}-${Date.now()}`;

      if (text && url) {
        tweets.push({
          id,
          text,
          date,
          author: account,
          url,
        });
      }
    }
  } catch (error) {
    console.error(`[Twitter Parser] Error parsing Nitter RSS for @${account}:`, error);
  }

  return tweets;
}

// Alternative: Fetch tweets via embedded links (fallback method)
export function generateTwitterEmbedLinks(): InsertFeedItem[] {
  const items: InsertFeedItem[] = [];

  for (const account of TWITTER_ACCOUNTS) {
    const sourceId = `twitter-embed-${account}`;
    const url = `https://twitter.com/${account}`;

    items.push({
      sourceId,
      type: "tweet",
      source: "twitter",
      title: `Follow @${account}`,
      description: `Latest tweets from @${account}`,
      content: `Visit Twitter profile for @${account}`,
      author: account,
      url,
      publishedAt: new Date(),
      imageUrl: null,
      tags: JSON.stringify(["twitter", "profile"]),
      metrics: null,
    });
  }

  return items;
}
