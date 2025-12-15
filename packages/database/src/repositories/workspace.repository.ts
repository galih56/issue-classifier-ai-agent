
import { createDbClient } from "../client";
import * as schema from "../schema";

let dbInstance: ReturnType<typeof createDbClient> | null = null;

/**
 * Get or create database instance
 */
function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    dbInstance = createDbClient(connectionString);
  }
  return dbInstance;
}

export interface CreateWorkspaceParams {
  name: string;
  description?: string;
}

export async function createWorkspace(params: CreateWorkspaceParams) {
  const db = getDb();
  const [workspace] = await db
    .insert(schema.workspaces)
    .values({
      name: params.name,
      description: params.description,
    })
    .returning();

  return workspace;
}

export async function getWorkspaces() {
  return await db.select().from(schema.workspaces);
}
