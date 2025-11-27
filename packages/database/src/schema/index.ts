/**
 * Database schema exports.
 *
 * This file exports both:
 * 1. Better-auth generated schema (auth tables: user, session, account, verification)
 * 2. Resources schema (your manually defined tables)
 *
 * Usage in your app:
 * ```ts
 * import * as schema from "@repo/database/schema";
 *
 * // Access auth tables
 * const users = await db.select().from(schema.user);
 *
 * // Access resources tables
 * const posts = await db.select().from(schema.posts);
 * ```
 *
 * Schema Generation:
 * - Run `pnpm db:schema` to generate auth tables from better-auth config
 * - Edit `src/schema/resources.ts` to add your own tables
 * - Run `pnpm db:generate` to create migrations for both
 */

export * from "./auth";
export * from "./resources";
export * from "./relations";
