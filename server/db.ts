import { eq, desc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, feedItems, InsertFeedItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFeedItems(limit: number = 50, offset: number = 0, filters?: { type?: string; source?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(feedItems);

  if (filters?.type) {
    query = query.where(eq(feedItems.type, filters.type as any));
  }

  if (filters?.source) {
    query = query.where(eq(feedItems.source, filters.source));
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      sql`${feedItems.title} LIKE ${searchTerm} OR ${feedItems.description} LIKE ${searchTerm}`
    );
  }

  const result = await query
    .orderBy(desc(feedItems.publishedAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function upsertFeedItem(item: InsertFeedItem): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(feedItems).values(item).onDuplicateKeyUpdate({
      set: {
        title: item.title,
        description: item.description,
        content: item.content,
        author: item.author,
        imageUrl: item.imageUrl,
        tags: item.tags,
        metrics: item.metrics,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert feed item:", error);
    throw error;
  }
}

export async function getFeedItemsBySource(source: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(feedItems)
    .where(eq(feedItems.source, source))
    .orderBy(desc(feedItems.publishedAt))
    .limit(limit);

  return result;
}

export async function getFeedItemCount(filters?: { type?: string; source?: string }) {
  const db = await getDb();
  if (!db) return 0;

  let query: any = db.select({ count: count() }).from(feedItems);

  if (filters?.type) {
    query = query.where(eq(feedItems.type, filters.type as any));
  }

  if (filters?.source) {
    query = query.where(eq(feedItems.source, filters.source));
  }

  const result = await query;
  return result[0]?.count || 0;
}

// TODO: add feature queries here as your schema grows.
