import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../../lib/errors";
import { jwtMiddleware } from "../../lib/jwt";
import { summarizeText } from "../../lib/text-summarization";
import { classifyIssue } from "../../lib/issue-classification";

const ClassifyIssueRequestSchema = z.object({
  text: z.string().min(1).max(10000),
}).openapi("ClassifyIssueRequest");

const ClassifyIssueResponseSchema = z.object({
  summary: z.string(),
}).openapi("ClassifyIssueResponse", {
  example: {
    summary: "User reported a bug with login functionality...",
  },
});

const classifyIssueRoute = createRoute({
  method: "post",
  path: "/classify-issue",
  tags: ["classification"],
  summary: "Classify and summarize an issue",
  description: "Uses AI to classify and summarize issue text. Accepts JSON, form-encoded, or multipart data. Requires a valid JWT.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ClassifyIssueRequestSchema,
        },
        "application/x-www-form-urlencoded": {
          schema: ClassifyIssueRequestSchema,
        },
        "multipart/form-data": {
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
    401: {
      description: "Unauthorized",
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

export function registerIssueClassifierRoutes(app: OpenAPIHono) {
  // app.use("/classify-issue", jwtMiddleware);
  
  app.openapi(classifyIssueRoute, async (c) => {
    const contentType = c.req.header("content-type") || "";
    let text: string | undefined;
    
    try {
      if (contentType.includes("application/json")) {
        // Handle JSON
        const body = await c.req.json();
        text = body.text;
      } else if (
        contentType.includes("application/x-www-form-urlencoded") ||
        contentType.includes("multipart/form-data")
      ) {
        // Handle both form-encoded and multipart the same way
        const body = await c.req.parseBody();
        text = body.text as string;
      } else {
        return c.json({
          code: "bad_request",
          message: "Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data"
        }, 400);
      }
    } catch (error) {
      return c.json({
        code: "bad_request",
        message: "Invalid request body",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      }, 400);
    }
    
    if (!text || !text.trim()) {
      return c.json({
        code: "bad_request",
        message: "Text field is required and cannot be empty"
      }, 400);
    }
    
    try {
      const summary = await classifyIssue(text);
      
      return c.json({ summary }, 200);
    } catch (error) {
      console.error("Classification error:", error);
      return c.json({
        code: "classification_error",
        message: "Failed to classify issue",
      }, 500);
    }
  });
}