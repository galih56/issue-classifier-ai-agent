import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { badRequest, ErrorResponseSchema, notFound } from "../lib/errors";
import { jwtMiddleware, requireScope } from "../lib/jwt";
import { UserService } from "../services/user.service";

const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    role: z.enum(["user", "admin"]),
    image: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("User");

const UserListResponseSchema = z
  .object({
    users: z.array(UserSchema),
    total: z.number(),
  })
  .openapi("UserListResponse");

const CreateUserRequestSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    emailVerified: z.boolean().optional().default(false),
    role: z.enum(["user", "admin"]).optional().default("user"),
  })
  .openapi("CreateUserRequest");

const UpdateUserRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    emailVerified: z.boolean().optional(),
    role: z.enum(["user", "admin"]).optional(),
  })
  .openapi("UpdateUserRequest");

// List Users
const listUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["users"],
  summary: "List all users (admin only)",
  description: "Returns a list of all users. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: UserListResponseSchema,
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
      description: "Forbidden (not admin)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Get User by ID
const getUserRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  tags: ["users"],
  summary: "Get user by ID (admin only)",
  description: "Returns a single user by ID. Requires admin scope.",
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
          schema: UserSchema,
        },
      },
    },
    404: {
      description: "User not found",
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
      description: "Forbidden (not admin)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Create User
const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["users"],
  summary: "Create a new user (admin only)",
  description: "Creates a new user. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created",
      content: {
        "application/json": {
          schema: UserSchema,
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
      description: "Forbidden (not admin)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Update User
const updateUserRoute = createRoute({
  method: "put",
  path: "/users/{id}",
  tags: ["users"],
  summary: "Update a user (admin only)",
  description: "Updates an existing user. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateUserRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: "User not found",
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
      description: "Forbidden (not admin)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Delete User
const deleteUserRoute = createRoute({
  method: "delete",
  path: "/users/{id}",
  tags: ["users"],
  summary: "Delete a user (admin only)",
  description: "Deletes an existing user. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "User deleted",
    },
    404: {
      description: "User not found",
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
      description: "Forbidden (not admin)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export function registerUserRoutes(app: OpenAPIHono) {
  // Apply JWT middleware and admin scope requirement
  app.use("/users/*", jwtMiddleware, requireScope("admin"));

  // List users
  app.openapi(listUsersRoute, async (c) => {
    const users = await UserService.getUsers();
    return c.json(
      {
        users: users.map((u) => ({
          ...u,
          role: u.role as "user" | "admin",
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        })),
        total: users.length,
      },
      200,
    );
  });

  // Get user by ID
  app.openapi(getUserRoute, async (c) => {
    const { id } = c.req.valid("param");
    const user = await UserService.getUserById(id);

    if (!user) {
      return notFound(c, "User not found");
    }

    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      200,
    );
  });

  // Create user
  app.openapi(createUserRoute, async (c) => {
    const body = c.req.valid("json");

    try {
      const user = await UserService.createUser(body);
      return c.json(
        {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        201,
      );
    } catch (error) {
      return badRequest(c, "Failed to create user", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Update user
  app.openapi(updateUserRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    try {
      const user = await UserService.updateUser(id, body);

      if (!user) {
        return notFound(c, "User not found");
      }

      return c.json(
        {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        200,
      );
    } catch (error) {
      return badRequest(c, "Failed to update user", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Delete user
  app.openapi(deleteUserRoute, async (c) => {
    const { id } = c.req.valid("param");

    try {
      const deleted = await UserService.deleteUser(id);

      if (!deleted) {
        return notFound(c, "User not found");
      }

      return c.body(null, 204);
    } catch (error) {
      return badRequest(c, "Failed to delete user", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
