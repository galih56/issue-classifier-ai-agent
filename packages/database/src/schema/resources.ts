import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Resources Schema
 *
 * Define your custom tables here. These tables are separate from the
 * better-auth generated tables (in auth.ts) and won't be overwritten
 * when you run `pnpm db:schema`.
 *
 * You can reference auth tables by importing them from "./auth".
 *
 * Example tables below - modify or delete as needed for your application.
 */

// Example: Blog posts table
export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  published: boolean("published").default(false).notNull(),

  // Reference to auth user table
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Example: Comments table
export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),

  // Reference to posts table
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),

  // Reference to auth user table
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Example: Post likes (many-to-many relationship)
export const postLikes = pgTable("post_likes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Add your own tables below following the same pattern:
 *
 * export const yourTable = pgTable("table_name", {
 *   id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
 *   // ... your columns
 *   createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
 * });
 */
