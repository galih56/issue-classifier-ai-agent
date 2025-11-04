import { createDbClient } from "@repo/database";
import { env } from "../env";

/**
 * Database client for the auth server.
 *
 * This wrapper:
 * 1. Imports the validated environment variables
 * 2. Passes the validated DATABASE_URL to the database package
 * 3. Exports a single database instance for use across the auth server
 *
 * Best practices:
 * - The app (this file) owns environment validation
 * - The package (@repo/database) is a pure utility that accepts parameters
 * - Clear separation of concerns
 */
export const db = createDbClient(env.DATABASE_URL);

// Export the type for use in other modules
export type Database = typeof db;
