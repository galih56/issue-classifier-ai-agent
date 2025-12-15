import { eq, and } from "drizzle-orm";
import { createDbClient } from "../client";
import * as schema from "../schema";
import type { Category, CollectionCategoryRecord } from "../types";

let dbInstance: ReturnType<typeof createDbClient> | null = null;

/**
 * Get or create database instance
 */
function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    dbInstance = createDbClient(connectionString);
  }
  return dbInstance;
}

// ============================================
// COLLECTIONS CRUD
// ============================================

/**
 * Get all collections
 */
export async function getAllCollections() {
  const db = getDb();
  return await db.select().from(schema.collections);
}

/**
 * Get collection by ID
 */
export async function getCollectionById(id: string) {
  const db = getDb();
  return await db.query.collections.findFirst({
    where: eq(schema.collections.id, id),
  });
}

/**
 * Get collection by name
 */
export async function getCollectionByName(name: string) {
  const db = getDb();
  return await db.query.collections.findFirst({
    where: eq(schema.collections.name, name),
  });
}

/**
 * Create a new collection
 */
export async function createCollection(data: {
  name: string;
  description?: string;
  workspaceId?: string;
}) {
  const db = getDb();
  const result = await db
    .insert(schema.collections)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update a collection
 */
export async function updateCollection(
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  const db = getDb();
  const result = await db
    .update(schema.collections)
    .set(data)
    .where(eq(schema.collections.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a collection
 */
export async function deleteCollection(id: string) {
  const db = getDb();
  const result = await db
    .delete(schema.collections)
    .where(eq(schema.collections.id, id))
    .returning();
  return result.length > 0;
}

// ============================================
// CATEGORIES CRUD
// ============================================

/**
 * Get all categories for a collection
 */
export async function getCategoriesByCollectionId(collectionId: string) {
  const db = getDb();
  return await db
    .select()
    .from(schema.collectionCategories)
    .where(eq(schema.collectionCategories.collectionId, collectionId));
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
  const db = getDb();
  return await db.query.collectionCategories.findFirst({
    where: eq(schema.collectionCategories.id, id),
  });
}

/**
 * Create a new category
 */
export async function createCategory(data: {
  collectionId: string;
  name: string;
  description?: string;
  parentId?: string;
  orderIndex?: number;
}) {
  const db = getDb();
  const result = await db
    .insert(schema.collectionCategories)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    parentId?: string;
    orderIndex?: number;
  }
) {
  const db = getDb();
  const result = await db
    .update(schema.collectionCategories)
    .set(data)
    .where(eq(schema.collectionCategories.id, id))
    .returning();
  return result[0];
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  const db = getDb();
  const result = await db
    .delete(schema.collectionCategories)
    .where(eq(schema.collectionCategories.id, id))
    .returning();
  return result.length > 0;
}

/**
 * Fetches categories and subcategories from the database for a given collection.
 * Reconstructs the tree structure required by the classifier.
 * 
 * @param collectionName - Name of the collection (e.g., "HR Issues")
 * @returns Array of categories with their subcategories
 */
export async function getCategoriesByCollection(
  collectionName: string
): Promise<Category[]> {
  const db = getDb();

  // Find the collection
  const collection = await db.query.collections.findFirst({
    where: eq(schema.collections.name, collectionName),
  });

  if (!collection) {
    console.warn(`Collection '${collectionName}' not found in database. Returning empty list.`);
    return [];
  }

  // Get all categories for this collection
  const allCategories = await db
    .select()
    .from(schema.collectionCategories)
    .where(eq(schema.collectionCategories.collectionId, collection.id));

  // Separate parents and children
  const parents = allCategories.filter((c) => !c.parentId);
  const children = allCategories.filter((c) => c.parentId);

  // Build the category tree
  const result: Category[] = parents.map((parent) => {
    const subcats = children
      .filter((child) => child.parentId === parent.id)
      .map((child) => {
        // If description is present, return object, else string
        if (child.description) {
          return {
            name: child.name,
            description: child.description,
          };
        }
        return child.name;
      });

    return {
      category: parent.name,
      description: parent.description || undefined,
      subcategories: subcats,
    };
  });

  return result;
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDbInstance() {
  dbInstance = null;
}
