import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Create a database client with the given connection string.
 *
 * @param connectionString - PostgreSQL connection string (validated by caller)
 * @returns Drizzle database instance
 *
 * @example
 * ```ts
 * import { createDbClient } from "@repo/database";
 * import { env } from "../env";
 *
 * export const db = createDbClient(env.DATABASE_URL);
 * ```
 */
export function createDbClient(connectionString: string) {
  if (!connectionString) {
    throw new Error(
      "Database connection string is required. " +
        "The calling application must validate and pass the DATABASE_URL.",
    );
  }

  // Create postgres client
  const client = postgres(connectionString);

  // Create and return Drizzle instance
  return drizzle(client);
}

// Export type for the database instance
export type DbClient = ReturnType<typeof createDbClient>;
