import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../lib/errors";
import { classifyIssue } from "../../lib-v2";
import { ISSUE_CATEGORIES } from "../../lib-v2/categories";
import { env } from "../../env";

const ClassifyIssueRequestSchema = z.object({
  text: z.string().min(1).max(10000),
}).openapi("ClassifyIssueRequestV2");

const TokenUsageSchema = z.object({
  inputTokens: z.number(),
  estimatedOutputTokens: z.number(),
  totalTokens: z.number(),
  estimatedCost: z.number(),
}).openapi("TokenUsage");

const ClassifyIssueResponseSchema = z.object({
  result: z.object({
    category: z.string(),
    subcategory: z.string(),
    reason: z.string(),
  }),
  tokenUsage: TokenUsageSchema,
}).openapi("ClassifyIssueResponseV2");

const classifyIssueRouteV2 = createRoute({
  method: "post",
  path: "/classify-issue",
  tags: ["classification-v2"],
  summary: "Classify issue (V2)",
  description: "Uses AI to classify issue text with token estimation (V2).",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ClassifyIssueRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: ClassifyIssueResponseSchema,
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export function registerIssueClassifierRoutesV2(app: OpenAPIHono) {
  app.openapi(classifyIssueRouteV2, async (c) => {
    const { text } = await c.req.json();

    try {
      const response = await classifyIssue(
        text,
        ISSUE_CATEGORIES,
        env.OPENROUTER_API_KEY!,
        "mistralai/mistral-nemo:free",
        "https://openrouter.ai/api/v1"
      );

      return c.json(response, 200);
    } catch (error) {
      console.error("Classification error:", error);
      return c.json({
        code: "classification_error",
        message: "Failed to classify issue",
      }, 500);
    }
  });
}
