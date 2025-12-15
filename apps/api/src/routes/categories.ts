import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { badRequest, ErrorResponseSchema, notFound } from "../lib/errors";
import { jwtMiddleware, requireScope } from "../lib/jwt";
import { CategoryService } from "../services/category.service";

// ============================================
// SCHEMAS
// ============================================

const CollectionSchema = z
  .object({
    id: z.string(),
    workspaceId: z.string().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("Collection");

const CategorySchema = z
  .object({
    id: z.string(),
    collectionId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    parentId: z.string().nullable(),
    orderIndex: z.number().nullable(),
    createdAt: z.string(),
  })
  .openapi("Category");

const CreateCollectionRequestSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    workspaceId: z.string().optional(),
  })
  .openapi("CreateCollectionRequest");

const UpdateCollectionRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .openapi("UpdateCollectionRequest");

const CreateCategoryRequestSchema = z
  .object({
    collectionId: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
    parentId: z.string().optional(),
    orderIndex: z.number().optional(),
  })
  .openapi("CreateCategoryRequest");

const UpdateCategoryRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    orderIndex: z.number().optional(),
  })
  .openapi("UpdateCategoryRequest");

// ============================================
// COLLECTION ROUTES
// ============================================

const listCollectionsRoute = createRoute({
  method: "get",
  path: "/collections",
  tags: ["collections"],
  summary: "List all collections",
  description: "Returns a list of all collections. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            collections: z.array(CollectionSchema),
            total: z.number(),
          }),
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

const getCollectionRoute = createRoute({
  method: "get",
  path: "/collections/{id}",
  tags: ["collections"],
  summary: "Get collection by ID",
  description: "Returns a single collection by ID. Requires admin scope.",
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
          schema: CollectionSchema,
        },
      },
    },
    404: {
      description: "Collection not found",
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

const createCollectionRoute = createRoute({
  method: "post",
  path: "/collections",
  tags: ["collections"],
  summary: "Create a new collection",
  description: "Creates a new collection. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCollectionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Collection created",
      content: {
        "application/json": {
          schema: CollectionSchema,
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

const updateCollectionRoute = createRoute({
  method: "put",
  path: "/collections/{id}",
  tags: ["collections"],
  summary: "Update a collection",
  description: "Updates an existing collection. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCollectionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Collection updated",
      content: {
        "application/json": {
          schema: CollectionSchema,
        },
      },
    },
    404: {
      description: "Collection not found",
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
  },
});

const deleteCollectionRoute = createRoute({
  method: "delete",
  path: "/collections/{id}",
  tags: ["collections"],
  summary: "Delete a collection",
  description: "Deletes an existing collection. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Collection deleted",
    },
    404: {
      description: "Collection not found",
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
// CATEGORY ROUTES
// ============================================

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/collections/{collectionId}/categories",
  tags: ["categories"],
  summary: "List all categories for a collection",
  description: "Returns a list of all categories for a specific collection. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      collectionId: z.string(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            categories: z.array(CategorySchema),
            total: z.number(),
          }),
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

const getCategoryRoute = createRoute({
  method: "get",
  path: "/categories/{id}",
  tags: ["categories"],
  summary: "Get category by ID",
  description: "Returns a single category by ID. Requires admin scope.",
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
          schema: CategorySchema,
        },
      },
    },
    404: {
      description: "Category not found",
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

const createCategoryRoute = createRoute({
  method: "post",
  path: "/categories",
  tags: ["categories"],
  summary: "Create a new category",
  description: "Creates a new category. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCategoryRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Category created",
      content: {
        "application/json": {
          schema: CategorySchema,
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

const updateCategoryRoute = createRoute({
  method: "put",
  path: "/categories/{id}",
  tags: ["categories"],
  summary: "Update a category",
  description: "Updates an existing category. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCategoryRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Category updated",
      content: {
        "application/json": {
          schema: CategorySchema,
        },
      },
    },
    404: {
      description: "Category not found",
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
  },
});

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/categories/{id}",
  tags: ["categories"],
  summary: "Delete a category",
  description: "Deletes an existing category. Requires admin scope.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Category deleted",
    },
    404: {
      description: "Category not found",
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

export function registerCategoryRoutes(app: OpenAPIHono) {
  // Apply JWT middleware and admin scope requirement
  console.log("Registering category routes");
  app.use("/collections/*", jwtMiddleware, requireScope("admin"));
  app.use("/categories/*", jwtMiddleware, requireScope("admin"));

  // Collection routes
  app.openapi(listCollectionsRoute, async (c) => {
    const collections = await CategoryService.getAllCollections();
    return c.json(
      {
        collections: collections.map((col) => ({
          ...col,
          createdAt: col.createdAt.toISOString(),
        })),
        total: collections.length,
      },
      200,
    );
  });

  app.openapi(getCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const collection = await CategoryService.getCollectionById(id);

    if (!collection) {
      return notFound(c, "Collection not found");
    }

    return c.json(
      {
        ...collection,
        createdAt: collection.createdAt.toISOString(),
      },
      200,
    );
  });

  app.openapi(createCollectionRoute, async (c) => {
    const body = c.req.valid("json");

    try {
      const collection = await CategoryService.createCollection(body);
      return c.json(
        {
          ...collection,
          createdAt: collection.createdAt.toISOString(),
        },
        201,
      );
    } catch (error) {
      return badRequest(c, "Failed to create collection", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.openapi(updateCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    try {
      const collection = await CategoryService.updateCollection(id, body);

      if (!collection) {
        return notFound(c, "Collection not found");
      }

      return c.json(
        {
          ...collection,
          createdAt: collection.createdAt.toISOString(),
        },
        200,
      );
    } catch (error) {
      return badRequest(c, "Failed to update collection", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.openapi(deleteCollectionRoute, async (c) => {
    const { id } = c.req.valid("param");

    try {
      const deleted = await CategoryService.deleteCollection(id);

      if (!deleted) {
        return notFound(c, "Collection not found");
      }

      return c.body(null, 204);
    } catch (error) {
      return badRequest(c, "Failed to delete collection", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Category routes
  app.openapi(listCategoriesRoute, async (c) => {
    const { collectionId } = c.req.valid("param");
    const categories = await CategoryService.getCategoriesByCollectionId(collectionId);
    return c.json(
      {
        categories: categories.map((cat) => ({
          ...cat,
          createdAt: cat.createdAt.toISOString(),
        })),
        total: categories.length,
      },
      200,
    );
  });

  app.openapi(getCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");
    const category = await CategoryService.getCategoryById(id);

    if (!category) {
      return notFound(c, "Category not found");
    }

    return c.json(
      {
        ...category,
        createdAt: category.createdAt.toISOString(),
      },
      200,
    );
  });

  app.openapi(createCategoryRoute, async (c) => {
    const body = c.req.valid("json");

    try {
      const category = await CategoryService.createCategory(body);
      return c.json(
        {
          ...category,
          createdAt: category.createdAt.toISOString(),
        },
        201,
      );
    } catch (error) {
      return badRequest(c, "Failed to create category", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.openapi(updateCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    try {
      const category = await CategoryService.updateCategory(id, body);

      if (!category) {
        return notFound(c, "Category not found");
      }

      return c.json(
        {
          ...category,
          createdAt: category.createdAt.toISOString(),
        },
        200,
      );
    } catch (error) {
      return badRequest(c, "Failed to update category", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.openapi(deleteCategoryRoute, async (c) => {
    const { id } = c.req.valid("param");

    try {
      const deleted = await CategoryService.deleteCategory(id);

      if (!deleted) {
        return notFound(c, "Category not found");
      }

      return c.body(null, 204);
    } catch (error) {
      return badRequest(c, "Failed to delete category", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
