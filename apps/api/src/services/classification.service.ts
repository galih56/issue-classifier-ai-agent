import { env } from "../env";
import {
  createInput,
  getInputById,
  createJob,
  updateJobStatus,
  updateJobMetrics,
  createClassification,
  getClassificationById,
  getClassificationByInputId,
  listClassifications,
  getCategoriesByCollection,
} from "@repo/database/repositories";
import * as schema from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { createDbClient } from "@repo/database/client";
import { classifyIssue } from "../lib-v2";

/**
 * Classification Service
 * 
 * Unified service that combines AI classification (lib-v2) with database persistence.
 * Handles the complete flow: input → job → AI classification → result storage
 */

export interface ClassifyAndStoreParams {
  text: string;
  workspaceId?: string;
  apiKeyId?: string;
  collectionName: string;
  source?: string;
  provider?: string;
  model?: string;
}

export interface ClassificationResponse {
  inputId: string;
  jobId: string;
  classificationId: string;
  result: {
    category: string;
    subcategory: string;
    reason: string;
  };
  tokenUsage: {
    inputTokens: number;
    estimatedOutputTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export class ClassificationService {
  /**
   * Main method: Classify text and persist all data
   * 
   * Flow:
   * 1. Fetch categories from database
   * 2. Create input record
   * 3. Create classification job
   * 4. Run AI classification
   * 5. Find matching category IDs
   * 6. Store classification result
   * 7. Update job with metrics
   */
  static async classifyAndStore(
    params: ClassifyAndStoreParams
  ): Promise<ClassificationResponse> {
    const startTime = Date.now();
    
    try {
      const categories = await getCategoriesByCollection(params.collectionName);
      console.log(categories)
      if (!categories || categories.length === 0) {
        throw new Error(`No categories found for collection: ${params.collectionName}`);
      }

      const input = await createInput({
        workspaceId: params.workspaceId,
        apiKeyId: params.apiKeyId,
        source: params.source || "api",
        rawText: params.text,
        rawMetadata: {
          collectionName: params.collectionName,
        },
      });

      const db = createDbClient(process.env.DATABASE_URL!);
      const collection = await db.query.collections.findFirst({
        where: eq(schema.collections.name, params.collectionName),
      });

      if (!collection) {
        throw new Error(`Collection not found: ${params.collectionName}`);
      }

      const job = await createJob({
        inputId: input.id,
        collectionId: collection.id,
        status: "processing",
        provider: params.provider || "openrouter",
        model: params.model || "mistralai/mistral-nemo:free",
      });

      // Update job to processing status with start time
      await updateJobStatus(job.id, {
        status: "processing",
        startedAt: new Date(),
      });

      try {
        const aiResponse = await classifyIssue(
          params.text,
          categories,
          env.OPENROUTER_API_KEY!,
          params.model || "mistralai/mistral-nemo:free",
          "https://openrouter.ai/api/v1"
        );

        // 6. Find matching category and subcategory IDs
        const categoryId = await this.findCategoryId(
          db,
          collection.id,
          aiResponse.result.category,
          aiResponse.result.subcategory
        );

        if (!categoryId) {
          throw new Error(
            `Category/subcategory not found in database: ${aiResponse.result.category} / ${aiResponse.result.subcategory}`
          );
        }

        const classification = await createClassification({
          jobId: job.id,
          inputId: input.id,
          categoryId: categoryId,
          explanation: aiResponse.result.reason,
        });

        const latencyMs = Date.now() - startTime;
        
        await updateJobMetrics(job.id, {
          promptTokens: aiResponse.tokenUsage.inputTokens,
          completionTokens: aiResponse.tokenUsage.estimatedOutputTokens,
          totalTokens: aiResponse.tokenUsage.totalTokens,
          costUsd: aiResponse.tokenUsage.estimatedCost,
          latencyMs: latencyMs,
          responseStatus: 200,
        });

        // Mark job as completed
        await updateJobStatus(job.id, {
          status: "completed",
          completedAt: new Date(),
        });

        return {
          inputId: input.id,
          jobId: job.id,
          classificationId: classification.id,
          result: aiResponse.result,
          tokenUsage: aiResponse.tokenUsage,
        };
      } catch (aiError) {
        // Mark job as failed
        await updateJobStatus(job.id, {
          status: "failed",
          errorMessage: aiError instanceof Error ? aiError.message : "Unknown error",
          completedAt: new Date(),
        });
        
        throw aiError;
      }
    } catch (error) {
      console.error("Classification error:", error);
      throw error;
    }
  }

  /**
   * Find category ID by name and subcategory name
   */
  private static async findCategoryId(
    db: ReturnType<typeof createDbClient>,
    collectionId: string,
    categoryName: string,
    subcategoryName: string
  ): Promise<string | null> {
    // Find parent category
    const parentCategory = await db.query.collectionCategories.findFirst({
      where: (categories: any, { and, eq, isNull }: any) =>
        and(
          eq(categories.collectionId, collectionId),
          eq(categories.name, categoryName),
          isNull(categories.parentId)
        ),
    });

    if (!parentCategory) {
      return null;
    }

    // Find subcategory  
    const subcategory = await db.query.collectionCategories.findFirst({
      where: (categories: any, { and, eq }: any) =>
        and(
          eq(categories.collectionId, collectionId),
          eq(categories.name, subcategoryName),
          eq(categories.parentId, parentCategory.id)
        ),
    });

    return subcategory?.id || null;
  }

  /**
   * Get classification by ID
   */
  static async getClassificationById(id: string) {
    return await getClassificationById(id);
  }

  /**
   * Get classification by input ID
   */
  static async getClassificationByInputId(inputId: string) {
    return await getClassificationByInputId(inputId);
  }

  /**
   * List classifications with optional filters
   */
  static async listClassifications(params?: {
    inputId?: string;
    jobId?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }) {
    return await listClassifications(params);
  }

  /**
   * Get input by ID
   */
  static async getInputById(id: string) {
    return await getInputById(id);
  }
}
