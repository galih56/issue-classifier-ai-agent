import * as schema from "./schema";

// ...

  // Create and return Drizzle instance
  return drizzle(client, { schema });
}

// Export type for the database instance
export type DbClient = ReturnType<typeof createDbClient>;
