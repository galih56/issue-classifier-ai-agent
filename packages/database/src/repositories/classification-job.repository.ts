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
 * Classification Job Repository - CRUD operations for classification_jobs table
 */

export interface CreateJobParams {
  inputId: string;
  collectionId: string;
  status?: string;
  priority?: number;
  provider?: string;
  model?: string;
  langchainMaxRetries?: number;
}

export interface UpdateJobStatusParams {
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface UpdateJobMetricsParams {
  responseStatus?: number;
  latencyMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUsd?: number;
}

/**
 * Create a new classification job
 */
export async function createJob(params: CreateJobParams) {
  const db = getDb();
  
  const [job] = await db
    .insert(schema.classificationJobs)
    .values({
      inputId: params.inputId,
      collectionId: params.collectionId,
      status: params.status || "pending",
      priority: params.priority,
      provider: params.provider,
      model: params.model,
      langchainMaxRetries: params.langchainMaxRetries,
    })
    .returning();
  
  return job;
}

/**
 * Get job by ID
 */
export async function getJobById(id: string) {
  const db = getDb();
  
  const job = await db.query.classificationJobs.findFirst({
    where: eq(schema.classificationJobs.id, id),
  });
  
  return job;
}

/**
 * Update job status
 */
export async function updateJobStatus(id: string, params: UpdateJobStatusParams) {
  const db = getDb();
  
  const updateData: any = {
    status: params.status,
  };
  
  if (params.errorMessage) {
    updateData.errorMessage = params.errorMessage;
  }
  
  if (params.startedAt) {
    updateData.startedAt = params.startedAt;
  }
  
  if (params.completedAt) {
    updateData.completedAt = params.completedAt;
  }
  
  const [updatedJob] = await db
    .update(schema.classificationJobs)
    .set(updateData)
    .where(eq(schema.classificationJobs.id, id))
    .returning();
  
  return updatedJob;
}

/**
 * Update job metrics (tokens, cost, latency)
 */
export async function updateJobMetrics(id: string, params: UpdateJobMetricsParams) {
  const db = getDb();
  
  const [updatedJob] = await db
    .update(schema.classificationJobs)
    .set(params)
    .where(eq(schema.classificationJobs.id, id))
    .returning();
  
  return updatedJob;
}

/**
 * List jobs with optional filtering
 */
export async function listJobs(params?: {
  inputId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  
  let query = db.select().from(schema.classificationJobs);
  
  if (params?.inputId) {
    query = query.where(eq(schema.classificationJobs.inputId, params.inputId)) as any;
  }
  
  if (params?.status) {
    query = query.where(eq(schema.classificationJobs.status, params.status)) as any;
  }
  
  if (params?.limit) {
    query = query.limit(params.limit) as any;
  }
  
  if (params?.offset) {
    query = query.offset(params.offset) as any;
  }
  
  const jobs = await query;
  return jobs;
}

/**
 * Delete job by ID
 */
export async function deleteJob(id: string) {
  const db = getDb();
  
  const [deletedJob] = await db
    .delete(schema.classificationJobs)
    .where(eq(schema.classificationJobs.id, id))
    .returning();
  
  return deletedJob;
}

/**
 * Increment attempt count
 */
export async function incrementAttemptCount(id: string) {
  const db = getDb();
  
  const job = await getJobById(id);
  if (!job) {
    throw new Error(`Job ${id} not found`);
  }
  
  const [updatedJob] = await db
    .update(schema.classificationJobs)
    .set({ attemptCount: (job.attemptCount || 0) + 1 })
    .where(eq(schema.classificationJobs.id, id))
    .returning();
  
  return updatedJob;
}


