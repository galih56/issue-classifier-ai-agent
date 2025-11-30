import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../lib/errors";
import { ClassificationService } from "../services/classification.service";
import { parseRequestBody } from "../lib/request-utils";

/**
 * Request schema for classification
 */
const ClassifyIssueRequestSchema = z
  .object({
    text: z.string().min(1).max(10000),
  })
  .openapi("ClassifyIssueRequest");

/**
 * Token usage schema used in the response
 */
const TokenUsageSchema = z
  .object({
    inputTokens: z.number(),
    estimatedOutputTokens: z.number(),
    totalTokens: z.number(),
    estimatedCost: z.number(),
  })
  .openapi("TokenUsage");

/**
 * Response schema for classification
 */
const ClassifyIssueResponseSchema = z
  .object({
    inputId: z.string(),
    jobId: z.string(),
    classificationId: z.string(),
    result: z.object({
      category: z.string(),
      subcategory: z.string(),
      reason: z.string(),
    }),
    tokenUsage: TokenUsageSchema,
  })
  .openapi("ClassifyIssueResponse");

export function registerIssueClassifierRoutes(app: OpenAPIHono) {
  app.openapi(
    createRoute({
      method: "post",
      path: "/classify-issue",
      tags: ["classification"],
      summary: "Classify issue",
      description:
        "Uses AI to classify issue text with token estimation and database persistence.",
      security: [{ bearerAuth: [] }],
      request: {
        // Accept three common content types
        body: {
          content: {
            "application/json": { schema: ClassifyIssueRequestSchema },
            "application/x-www-form-urlencoded": { schema: ClassifyIssueRequestSchema },
            "multipart/form-data": { schema: ClassifyIssueRequestSchema },
          },
        },
      },
      responses: {
        200: {
          description: "OK",
          content: { "application/json": { schema: ClassifyIssueResponseSchema } },
        },
        400: {
          description: "Bad Request",
          content: { "application/json": { schema: ErrorResponseSchema } },
        },
        500: {
          description: "Internal Server Error",
          content: { "application/json": { schema: ErrorResponseSchema } },
        },
      },
    }),
    async (c) => {
      // Parse request body according to content type
      let text: string;
      try {
        const body = await parseRequestBody(c);
        text = body.text as string;
      } catch (e) {
        return c.json(
          {
            code: "bad_request",
            message: e instanceof Error ? e.message : "Invalid request body",
          },
          400
        );
      }

      try {
        const response = await ClassificationService.classifyAndStore({
          text,
          collectionName: "HR Issues",
          source: "api",
          model: "openai/gpt-4o-mini-2024-07-18",
          workspaceId: undefined, // TODO: replace with real auth context values
          apiKeyId: undefined,
        });
        return c.json(response, 200);
      } catch (error) {
        console.error("Classification error:", error);
        return c.json(
          {
            code: "classification_error",
            message:
              error instanceof Error ? error.message : "Failed to classify issue",
          },
          500
        );
      }
    }
  );
}