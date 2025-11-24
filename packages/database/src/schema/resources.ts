import { boolean, integer, jsonb, pgTable, real, text, timestamp, vector } from "drizzle-orm/pg-core";
import { users } from "./auth";

/**
 * Resources Schema
 */

// ============================================
// CORE ENTITIES
// ============================================

export const workspaces = pgTable("workspaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  keyHash: text("key_hash").unique().notNull(),
  keyLast4: text("key_last4").notNull(),
  name: text("name"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
});

// ============================================
// COLLECTIONS & CATEGORIES
// ============================================

export const collections = pgTable("collections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const collectionCategories = pgTable("collection_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  collectionId: text("collection_id").references(() => collections.id),
  name: text("name").notNull(),
  description: text("description"),
  parentId: text("parent_id"), // Self-reference handled in logic or raw SQL if needed
  orderIndex: integer("order_index"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================
// INPUTS & JOBS
// ============================================

export const inputs = pgTable("inputs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  apiKeyId: text("api_key_id").references(() => apiKeys.id),
  source: text("source"), // "api", "webhook", "ui", "batch"
  rawText: text("raw_text"),
  rawMetadata: jsonb("raw_metadata"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const classificationJobs = pgTable("classification_jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inputId: text("input_id").references(() => inputs.id),
  collectionId: text("collection_id").references(() => collections.id),
  
  // Job status
  status: text("status").default("pending"), // "pending", "processing", "completed", "failed"
  priority: integer("priority").default(0),
  attemptCount: integer("attempt_count").default(0),
  maxAttempts: integer("max_attempts").default(3), // Job level retries
  langchainMaxRetries: integer("langchain_max_retries").default(1), // Internal library retries
  errorMessage: text("error_message"),
  
  // HTTP & Model info
  provider: text("provider"), // "openai", "anthropic", "openrouter"
  model: text("model"), // "gpt-4o-mini", "claude-sonnet-4"
  responseStatus: integer("response_status"),
  latencyMs: integer("latency_ms"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  costUsd: real("cost_usd"),
  
  // Timestamps
  scheduledAt: timestamp("scheduled_at", { mode: "date" }).defaultNow(),
  startedAt: timestamp("started_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================
// RESULTS
// ============================================

export const classifications = pgTable("classifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").references(() => classificationJobs.id),
  inputId: text("input_id").references(() => inputs.id),
  categoryId: text("category_id").references(() => collectionCategories.id),
  confidence: real("confidence"),
  explanation: text("explanation"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================
// FEEDBACK & OPTIMIZATION
// ============================================

export const classificationFeedback = pgTable("classification_feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  classificationId: text("classification_id").references(() => classifications.id),
  userId: text("user_id").references(() => users.id),
  correctCategoryId: text("correct_category_id").references(() => collectionCategories.id),
  isCorrect: boolean("is_correct"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const promptTemplates = pgTable("prompt_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  name: text("name"),
  version: text("version"),
  templateText: text("template_text"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ============================================
// OPTIONAL: SEMANTIC SEARCH
// ============================================

export const vectors = pgTable("vectors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inputId: text("input_id").references(() => inputs.id),
  embedding: vector("embedding", { dimensions: 1536 }), // Default OpenAI embedding size
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
