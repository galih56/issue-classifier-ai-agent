import { eq } from "drizzle-orm";
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
