import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { ErrorResponseSchema } from "../../lib/errors";
import { ClassificationService } from "../../services/classification.service";

/**
 * Extract the `text` field from the request body, handling JSON, URL‑encoded, and multipart payloads.
 * Mirrors the logic used in the v1 route.
 */
async function extractTextFromRequest(c: Context): Promise<string> {
  const contentType = c.req.header("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await c.req.json();
    return body.text as string;
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const body = await c.req.parseBody();
    return body.text as string;
  }
  throw new Error(
    "Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data"
  );
}

const ClassifyIssueRequestSchema = z
  .object({
    text: z.string().min(1).max(10000),
  })
  .openapi("ClassifyIssueRequestV2");

const TokenUsageSchema = z
  .object({
    inputTokens: z.number(),
    estimatedOutputTokens: z.number(),
    totalTokens: z.number(),
    estimatedCost: z.number(),
  })
  .openapi("TokenUsage");

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
  .openapi("ClassifyIssueResponseV2");

export function registerIssueClassifierRoutesV2(app: OpenAPIHono) {
  app.openapi(
    createRoute({
      method: "post",
      path: "/classify-issue",
      tags: ["classification-v2"],
      summary: "Classify issue (V2)",
      description:
        "Uses AI to classify issue text with token estimation and database persistence (V2).",
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
        text = await extractTextFromRequest(c);
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