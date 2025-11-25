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

/**
 * Input Repository - CRUD operations for inputs table
 */

export interface CreateInputParams {
  workspaceId?: string;
  apiKeyId?: string;
  source?: string;
  rawText: string;
  rawMetadata?: Record<string, any>;
}

export interface UpdateInputParams {
  rawText?: string;
  rawMetadata?: Record<string, any>;
}

/**
 * Create a new input record
 */
export async function createInput(params: CreateInputParams) {
  const db = getDb();
  
  const [input] = await db
    .insert(schema.inputs)
    .values({
      workspaceId: params.workspaceId,
      apiKeyId: params.apiKeyId,
      source: params.source,
      rawText: params.rawText,
      rawMetadata: params.rawMetadata,
    })
    .returning();
  
  return input;
}

/**
 * Get input by ID
 */
export async function getInputById(id: string) {
  const db = getDb();
  
  const input = await db.query.inputs.findFirst({
    where: eq(schema.inputs.id, id),
  });
  
  return input;
}

/**
 * List inputs with optional filtering
 */
export async function listInputs(params?: {
  workspaceId?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  
  let query = db.select().from(schema.inputs);
  
  if (params?.workspaceId) {
    query = query.where(eq(schema.inputs.workspaceId, params.workspaceId)) as any;
  }
  
  if (params?.limit) {
    query = query.limit(params.limit) as any;
  }
  
  if (params?.offset) {
    query = query.offset(params.offset) as any;
  }
  
  const inputs = await query;
  return inputs;
}

/**
 * Update input by ID
 */
export async function updateInput(id: string, params: UpdateInputParams) {
  const db = getDb();
  
  const [updatedInput] = await db
    .update(schema.inputs)
    .set(params)
    .where(eq(schema.inputs.id, id))
    .returning();
  
  return updatedInput;
}

/**
 * Delete input by ID
 */
export async function deleteInput(id: string) {
  const db = getDb();
  
  const [deletedInput] = await db
    .delete(schema.inputs)
    .where(eq(schema.inputs.id, id))
    .returning();
  
  return deletedInput;
}


