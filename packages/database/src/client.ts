import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Create a database client with Drizzle ORM
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database client instance
 */
export function createDbClient(connectionString: string) {
  // Create postgres client
  const client = postgres(connectionString, {
    max: 10, // Maximum number of connections
  });

  // Create and return Drizzle instance
  return drizzle(client, { schema });
}

// Export type for the database instance
export type DbClient = ReturnType<typeof createDbClient>;
