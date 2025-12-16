import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { badRequest, ErrorResponseSchema, notFound, forbidden } from "../lib/errors";
import { jwtMiddleware } from "../lib/jwt";
import {
  createWorkspaceForUser,
  getWorkspacesForUser,
  getWorkspace,
  updateWorkspaceById,
  deleteWorkspaceById,
} from "../services/workspace.service";




// ============================================
// SCHEMAS
// ============================================

const WorkspaceSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
    creatorId: z.string().optional().nullable(),
  })
  .openapi("Workspace");

const CreateWorkspaceRequestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .openapi("CreateWorkspaceRequest");

const UpdateWorkspaceRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .openapi("UpdateWorkspaceRequest");

const WorkspaceListResponseSchema = z
  .object({
    workspaces: z.array(WorkspaceSchema),
  })
  .openapi("WorkspaceListResponse");

// ============================================
// WORKSPACE ROUTES
// ============================================

const listWorkspacesRoute = createRoute({
  method: "get",
  path: "/workspaces",
  tags: ["workspaces"],
  summary: "List all workspaces",
  description: "List workspaces. Admin sees all, User sees created by them.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: WorkspaceListResponseSchema,
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

const getWorkspaceRoute = createRoute({
  method: "get",
  path: "/workspaces/{id}",
  tags: ["workspaces"],
  summary: "Get workspace by ID",
  description: "Get a workspace. Creator or Admin only.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            workspace: WorkspaceSchema,
          }),
        },
      },
    },
    404: {
      description: "Workspace not found",
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
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

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

const updateWorkspaceRoute = createRoute({
  method: "put",
  path: "/workspaces/{id}",
  tags: ["workspaces"],
  summary: "Update workspace",
  description: "Update a workspace. Creator or Admin only.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateWorkspaceRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Workspace updated",
      content: {
        "application/json": {
          schema: z.object({
            workspace: WorkspaceSchema,
          }),
        },
      },
    },
    404: {
      description: "Workspace not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const deleteWorkspaceRoute = createRoute({
  method: "delete",
  path: "/workspaces/{id}",
  tags: ["workspaces"],
  summary: "Delete workspace",
  description: "Delete a workspace. Creator or Admin only.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Workspace deleted",
    },
    404: {
      description: "Workspace not found",
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
    403: {
      description: "Forbidden",
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

  app.openapi(listWorkspacesRoute, async (c) => {
    const payload = (c as any).get("jwtPayload") as { sub: string; scp?: string[] } | undefined;
    const isAdmin = payload?.scp?.includes("admin") ?? false;
    const workspaces = await getWorkspacesForUser(isAdmin, payload?.sub);
    return c.json(
      {
        workspaces: workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          description: w.description,
          createdAt: w.createdAt.toISOString(),
          creatorId: w.creatorId,
        })),
      },
      200
    );
  });

  app.openapi(getWorkspaceRoute, async (c) => {
    const { id } = c.req.valid("param");
    const payload = (c as any).get("jwtPayload") as { sub: string; scp?: string[] } | undefined;
    
    const workspace = await getWorkspace(id);
    if (!workspace) {
      return notFound(c, "Workspace not found");
    }

    const isAdmin = payload?.scp?.includes("admin");
    const isOwner = workspace.creatorId === payload?.sub;

    if (!isAdmin && !isOwner) {
      return forbidden(c, "You generally need to be the creator or admin to view this.");
    }

    return c.json(
      {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          createdAt: workspace.createdAt.toISOString(),
          creatorId: workspace.creatorId,
        },
      },
      200
    );
  });

  app.openapi(createWorkspaceRoute, async (c) => {
    const body = c.req.valid("json");
    const payload = (c as any).get("jwtPayload") as { sub: string } | undefined;

    try {
      const workspace = await createWorkspaceForUser({
        ...body,
        creatorId: payload?.sub,
      });
      return c.json(
        {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            createdAt: workspace.createdAt.toISOString(),
            creatorId: workspace.creatorId,
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

  app.openapi(updateWorkspaceRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const payload = (c as any).get("jwtPayload") as { sub: string; scp?: string[] } | undefined;

    try {
      const existing = await getWorkspace(id);
      if (!existing) {
        return notFound(c, "Workspace not found");
      }

      const isAdmin = payload?.scp?.includes("admin");
      const isOwner = existing.creatorId === payload?.sub;

      if (!isAdmin && !isOwner) {
        return forbidden(c, "You generally need to be the creator or admin to modify this.");
      }

      const workspace = await updateWorkspaceById(id, body);
      if (!workspace) {
        return notFound(c, "Workspace not found");
      }

      return c.json(
        {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            createdAt: workspace.createdAt.toISOString(),
            creatorId: workspace.creatorId,
          },
        },
        200
      );
    } catch (error) {
      return badRequest(c, "Failed to update workspace", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.openapi(deleteWorkspaceRoute, async (c) => {
    const { id } = c.req.valid("param");
    const payload = (c as any).get("jwtPayload") as { sub: string; scp?: string[] } | undefined;

    try {
      const existing = await getWorkspace(id);
      if (!existing) {
        return notFound(c, "Workspace not found");
      }

      const isAdmin = payload?.scp?.includes("admin");
      const isOwner = existing.creatorId === payload?.sub;

      if (!isAdmin && !isOwner) {
        return forbidden(c, "You generally need to be the creator or admin to delete this.");
      }

      const deleted = await deleteWorkspaceById(id);
      if (!deleted) {
        return notFound(c, "Workspace not found");
      }

      return c.body(null, 204);
    } catch (error) {
      return badRequest(c, "Failed to delete workspace", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
