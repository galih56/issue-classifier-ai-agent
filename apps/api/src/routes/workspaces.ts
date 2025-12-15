import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { badRequest, ErrorResponseSchema } from "../lib/errors";
import { jwtMiddleware } from "../lib/jwt";
import { createWorkspaceForUser } from "../services/workspace.service";

// ============================================
// SCHEMAS
// ============================================

const WorkspaceSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("Workspace");

const CreateWorkspaceRequestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .openapi("CreateWorkspaceRequest");

// ============================================
// WORKSPACE ROUTES
// ============================================

const createWorkspaceRoute = createRoute({
  method: "post",
  path: "/workspaces",
  tags: ["workspaces"],
  summary: "Create a new workspace",
  description: "Creates a new workspace for the authenticated user.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateWorkspaceRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Workspace created",
      content: {
        "application/json": {
          schema: z.object({
            workspace: WorkspaceSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid request",
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
  },
});

// ============================================
// ROUTE REGISTRATION
// ============================================

export function registerWorkspaceRoutes(app: OpenAPIHono) {
  // Apply JWT middleware
  app.use("/workspaces/*", jwtMiddleware);

  app.openapi(createWorkspaceRoute, async (c) => {
    const body = c.req.valid("json");

    try {
      const workspace = await createWorkspaceForUser(body);
      return c.json(
        {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            createdAt: workspace.createdAt.toISOString(),
          },
        },
        201,
      );
    } catch (error) {
      return badRequest(c, "Failed to create workspace", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
