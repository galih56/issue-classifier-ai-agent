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
 * Classification Repository - CRUD operations for classifications table
 */

export interface CreateClassificationParams {
  jobId: string;
  inputId: string;
  categoryId: string;
  confidence?: number;
  explaination?: string;
}

export interface UpdateClassificationParams {
  categoryId?: string;
  confidence?: number;
  explaination?: string;
}

/**
 * Create a new classification result
 */
export async function createClassification(params: CreateClassificationParams) {
  const db = getDb();
  
  const [classification] = await db
    .insert(schema.classifications)
    .values({
      jobId: params.jobId,
      inputId: params.inputId,
      categoryId: params.categoryId,
      confidence: params.confidence,
      explaination: params.explaination,
    })
    .returning();
  
  return classification;
}

/**
 * Get classification by ID
 */
export async function getClassificationById(id: string) {
  const db = getDb();
  
  const classification = await db.query.classifications.findFirst({
    where: eq(schema.classifications.id, id),
    with: {
      input: true,
      job: true,
    },
  });
  
  return classification;
}

/**
 * Get classification by input ID
 */
export async function getClassificationByInputId(inputId: string) {
  const db = getDb();
  
  const classification = await db.query.classifications.findFirst({
    where: eq(schema.classifications.inputId, inputId),
    with: {
      job: true,
      category: {
        with: {
          parent: true,
        },
      },
    },
  });
  
  return classification;
}

/**
 * Get classification by job ID
 */
export async function getClassificationByJobId(jobId: string) {
  const db = getDb();
  
  const classification = await db.query.classifications.findFirst({
    where: eq(schema.classifications.jobId, jobId),
  });
  
  return classification;
}

/**
 * List classifications with optional filtering
 */
export async function listClassifications(params?: {
  inputId?: string;
  jobId?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  
  let query = db.select().from(schema.classifications);
  
  if (params?.inputId) {
    query = query.where(eq(schema.classifications.inputId, params.inputId)) as any;
  }
  
  if (params?.jobId) {
    query = query.where(eq(schema.classifications.jobId, params.jobId)) as any;
  }
  
  if (params?.categoryId) {
    query = query.where(eq(schema.classifications.categoryId, params.categoryId)) as any;
  }
  
  if (params?.limit) {
    query = query.limit(params.limit) as any;
  }
  
  if (params?.offset) {
    query = query.offset(params.offset) as any;
  }
  
  const classifications = await query;
  return classifications;
}

/**
 * Update classification by ID
 */
export async function updateClassification(id: string, params: UpdateClassificationParams) {
  const db = getDb();
  
  const [updatedClassification] = await db
    .update(schema.classifications)
    .set(params)
    .where(eq(schema.classifications.id, id))
    .returning();
  
  return updatedClassification;
}

/**
 * Delete classification by ID
 */
export async function deleteClassification(id: string) {
  const db = getDb();
  
  const [deletedClassification] = await db
    .delete(schema.classifications)
    .where(eq(schema.classifications.id, id))
    .returning();
  
  return deletedClassification;
}


