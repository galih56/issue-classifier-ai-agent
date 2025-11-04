import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";

const PublicInfoSchema = z
  .object({
    status: z.string(),
  })
  .openapi("PublicInfo", { example: { status: "ok" } });

const publicRoute = createRoute({
  method: "get",
  path: "/public",
  tags: ["public"],
  summary: "Public status endpoint",
  description: "Returns a public status payload. No authentication required.",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: PublicInfoSchema,
        },
      },
    },
  },
});

export function registerPublicRoutes(app: OpenAPIHono) {
  app.openapi(publicRoute, (c) => {
    return c.json({ status: "ok" }, 200);
  });
}
