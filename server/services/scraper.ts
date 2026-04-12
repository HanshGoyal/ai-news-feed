import axios from "axios";
import * as cheerio from "cheerio";
import { InsertFeedItem } from "../../drizzle/schema";

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
});

export async function scrapeGitHubTrending(): Promise<InsertFeedItem[]> {
  try {
    const response = await axiosInstance.get("https://github.com/trending?since=daily&spoken_language_code=&d=1");
    const $ = cheerio.load(response.data);
    const items: InsertFeedItem[] = [];

    $("article.Box-row").each((index, element) => {
      const $elem = $(element);
      const titleElem = $elem.find("h2 a");
      const href = titleElem.attr("href") || "";
      const title = titleElem.text().trim().replace(/\n/g, " ");
      const description = $elem.find("p.col-9").text().trim() || "GitHub trending repository";
      const starsElem = $elem.find("span.d-inline-block.float-sm-right");
      const stars = starsElem.first().text().trim() || "0";

      if (!href || !title) return;

      const sourceId = `github-${href}`;
      const url = `https://github.com${href}`;

      items.push({
        sourceId,
        type: "github",
        source: "github",
        title: `[Trending] ${title}`,
        description: description || "GitHub trending repository",
        content: `Stars: ${stars}`,
        author: "GitHub",
        url,
        publishedAt: new Date(),
        imageUrl: null,
        tags: JSON.stringify(["trending", "repository"]),
        metrics: JSON.stringify({ stars }),
      });
    });

    return items.slice(0, 20); // Limit to 20 items
  } catch (error) {
    console.error("[Scraper] Error scraping GitHub Trending:", error);
    return [];
  }
}

export async function scrapeThereIsAnAIForThat(): Promise<InsertFeedItem[]> {
  try {
    const response = await axiosInstance.get("https://theresanaiforthat.com/");
    const $ = cheerio.load(response.data);
    const items: InsertFeedItem[] = [];

    // Scrape AI tools from the page
    $("div[data-testid='tool-card'], div.tool-card, a[href*='/ai/']").each((index, element) => {
      if (items.length >= 20) return; // Limit to 20 items

      const $elem = $(element);
      const titleElem = $elem.find("h3, h2, [data-testid='tool-name']").first();
      const title = titleElem.text().trim();
      const descriptionElem = $elem.find("p, [data-testid='tool-description']").first();
      const description = descriptionElem.text().trim();
      const linkElem = $elem.find("a[href]").first();
      const href = linkElem.attr("href") || $elem.attr("href") || "";

      if (!title || !href) return;

      const fullUrl = href.startsWith("http") ? href : `https://theresanaiforthat.com${href}`;
      const sourceId = `ai_tools-${href}`;

      items.push({
        sourceId,
        type: "ai_tool",
        source: "ai_tools",
        title: title,
        description: description || "AI-powered tool",
        content: description || "",
        author: "There's An AI For That",
        url: fullUrl,
        publishedAt: new Date(),
        imageUrl: null,
        tags: JSON.stringify(["ai", "tool"]),
        metrics: null,
      });
    });

    return items;
  } catch (error) {
    console.error("[Scraper] Error scraping There's An AI For That:", error);
    return [];
  }
}

export async function scrapeTechXplore(): Promise<InsertFeedItem[]> {
  try {
    const response = await axiosInstance.get(
      "https://techxplore.com/machine-learning-ai-news/"
    );
    const $ = cheerio.load(response.data);
    const items: InsertFeedItem[] = [];

    // Scrape news items from TechXplore
    $(".news-item, article, div[data-article], .article-item").each((index, element) => {
      if (items.length >= 15) return;

      const $elem = $(element);
      const titleElem = $elem.find("h3, h2, a.title").first();
      const title = titleElem.text().trim();
      const descriptionElem = $elem.find("p, .summary, .description").first();
      const description = descriptionElem.text().trim();
      const linkElem = $elem.find("a[href]").first();
      const href = linkElem.attr("href") || "";

      if (!title || !href) return;

      const fullUrl = href.startsWith("http") ? href : `https://techxplore.com${href}`;
      const sourceId = `techxplore-${href}`;

      items.push({
        sourceId,
        type: "article",
        source: "techxplore",
        title: title,
        description: description || "TechXplore ML/AI news",
        content: description || "",
        author: "TechXplore",
        url: fullUrl,
        publishedAt: new Date(),
        imageUrl: null,
        tags: JSON.stringify(["ai", "ml", "news"]),
        metrics: null,
      });
    });

    return items;
  } catch (error) {
    console.error("[Scraper] Error scraping TechXplore:", error);
    return [];
  }
}

export async function scrapePapersWithCode(): Promise<InsertFeedItem[]> {
  try {
    // Papers With Code was shut down in 2025, but we can try to fetch from archive or alternatives
    const response = await axiosInstance.get("https://paperswithcode.com/latest");
    const $ = cheerio.load(response.data);
    const items: InsertFeedItem[] = [];

    // Scrape papers/projects
    $(".paper-item, article, div[data-paper], .project-card").each((index, element) => {
      if (items.length >= 15) return;

      const $elem = $(element);
      const titleElem = $elem.find("h3, h2, a.title").first();
      const title = titleElem.text().trim();
      const descriptionElem = $elem.find("p, .abstract, .description").first();
      const description = descriptionElem.text().trim();
      const linkElem = $elem.find("a[href]").first();
      const href = linkElem.attr("href") || "";

      if (!title || !href) return;

      const fullUrl = href.startsWith("http") ? href : `https://paperswithcode.com${href}`;
      const sourceId = `pwc-${href}`;

      items.push({
        sourceId,
        type: "article",
        source: "papers_with_code",
        title: title,
        description: description || "Research paper with code",
        content: description || "",
        author: "Papers with Code",
        url: fullUrl,
        publishedAt: new Date(),
        imageUrl: null,
        tags: JSON.stringify(["research", "paper", "code"]),
        metrics: null,
      });
    });

    return items;
  } catch (error) {
    console.error("[Scraper] Error scraping Papers with Code:", error);
    return [];
  }
}

export async function scrapeEmergentMind(): Promise<InsertFeedItem[]> {
  try {
    const response = await axiosInstance.get("https://www.emergentmind.com/");
    const $ = cheerio.load(response.data);
    const items: InsertFeedItem[] = [];

    // Scrape news items from Emergent Mind
    $("article, div[data-testid='news-item'], div.news-item").each((index, element) => {
      if (items.length >= 15) return;

      const $elem = $(element);
      const titleElem = $elem.find("h2, h3, a").first();
      const title = titleElem.text().trim();
      const descriptionElem = $elem.find("p, .description").first();
      const description = descriptionElem.text().trim();
      const linkElem = $elem.find("a[href]").first();
      const href = linkElem.attr("href") || "";

      if (!title || !href) return;

      const fullUrl = href.startsWith("http") ? href : `https://www.emergentmind.com${href}`;
      const sourceId = `emergent_mind-${href}`;

      items.push({
        sourceId,
        type: "article",
        source: "emergent_mind",
        title: title,
        description: description || "AI news from Emergent Mind",
        content: description || "",
        author: "Emergent Mind",
        url: fullUrl,
        publishedAt: new Date(),
        imageUrl: null,
        tags: JSON.stringify(["ai", "news"]),
        metrics: null,
      });
    });

    return items;
  } catch (error) {
    console.error("[Scraper] Error scraping Emergent Mind:", error);
    return [];
  }
}
