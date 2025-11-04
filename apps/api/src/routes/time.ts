import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../lib/errors";
import { jwtMiddleware } from "../lib/jwt";

const TimeResponseSchema = z
  .object({
    epoch: z.number(),
    iso: z.string(),
  })
  .openapi("TimeResponse", {
    example: {
      epoch: 1734200000,
      iso: "2025-10-14T12:00:00.000Z",
    },
  });

const timeRoute = createRoute({
  method: "get",
  path: "/time",
  tags: ["resource"],
  summary: "Current server time (protected)",
  description: "Returns current server time. Requires a valid JWT.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: TimeResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (invalid/expired token)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden (insufficient permissions)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export function registerTimeRoutes(app: OpenAPIHono) {
  app.use("/time", jwtMiddleware);
  app.openapi(timeRoute, (c) => {
    const now = new Date();
    return c.json(
      {
        epoch: Math.floor(now.getTime() / 1000),
        iso: now.toISOString(),
      },
      200,
    );
  });
}
