import { eq } from "drizzle-orm";
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
  creatorId?: string;
}

export async function createWorkspace(params: CreateWorkspaceParams) {
  const db = getDb();
  const [workspace] = await db
    .insert(schema.workspaces)
    .values({
      name: params.name,
      description: params.description,
      creatorId: params.creatorId,
    })
    .returning();

  return workspace;
}

export async function getWorkspaces(creatorId?: string) {
  const db = getDb();
  if (creatorId) {
    return await db.select().from(schema.workspaces).where(eq(schema.workspaces.creatorId, creatorId));
  }
  return await db.select().from(schema.workspaces);
}

export async function getWorkspaceById(id: string) {
  const db = getDb();
  const [workspace] = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, id));
  return workspace;
}

export async function updateWorkspace(id: string, params: Partial<CreateWorkspaceParams>) {
  const db = getDb();
  const [workspace] = await db
    .update(schema.workspaces)
    .set({
      name: params.name,
      description: params.description,
    })
    .where(eq(schema.workspaces.id, id))
    .returning();
  return workspace;
}

export async function deleteWorkspace(id: string) {
  const db = getDb();
  const [workspace] = await db
    .delete(schema.workspaces)
    .where(eq(schema.workspaces.id, id))
    .returning();
  return !!workspace;
}
