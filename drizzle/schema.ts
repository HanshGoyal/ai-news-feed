import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Feed items table for storing aggregated content from various sources.
 * Includes articles, tweets, GitHub repos, and AI tools.
 */
export const feedItems = mysqlTable("feedItems", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique identifier for the item (usually from source) */
  sourceId: varchar("sourceId", { length: 255 }).notNull().unique(),
  /** Type of content: 'article', 'tweet', 'github', 'ai_tool' */
  type: mysqlEnum("type", ["article", "tweet", "github", "ai_tool"]).notNull(),
  /** Source name: 'tds', 'arxiv', 'deeplearning', 'emergent_mind', 'github', 'ai_tools', 'twitter' */
  source: varchar("source", { length: 64 }).notNull(),
  /** Article/tweet title */
  title: text("title").notNull(),
  /** Brief description or excerpt */
  description: text("description"),
  /** Full content (if available) */
  content: text("content"),
  /** Author/creator name */
  author: varchar("author", { length: 255 }),
  /** Link to original content */
  url: varchar("url", { length: 2048 }).notNull(),
  /** Publication/creation date */
  publishedAt: timestamp("publishedAt").notNull(),
  /** Image/thumbnail URL */
  imageUrl: varchar("imageUrl", { length: 2048 }),
  /** Tags/categories (JSON array) */
  tags: text("tags"),
  /** Engagement metrics (for tweets: likes, retweets, etc.) */
  metrics: text("metrics"),
  /** When this item was added to our database */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last time this item was updated */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedItem = typeof feedItems.$inferSelect;
export type InsertFeedItem = typeof feedItems.$inferInsert;