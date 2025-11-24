import * as schema from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { Category, Subcategory } from "../lib-v2/types";

/**
 * Fetches categories and subcategories from the database for the "HR Issues" collection.
 * Reconstructs the tree structure required by the classifier.
 */
export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    // 1. Get the "HR Issues" collection
    const collection = await db.query.collections.findFirst({
      where: eq(schema.collections.name, "HR Issues"),
    });

    if (!collection) {
      console.warn("Collection 'HR Issues' not found in database. Returning empty list.");
      return [];
    }

    // 2. Fetch all categories for this collection
    const allCategories = await db.select().from(schema.collectionCategories)
      .where(eq(schema.collectionCategories.collectionId, collection.id));

    // 3. Separate parents and children
    const parents = allCategories.filter(c => !c.parentId);
    const children = allCategories.filter(c => c.parentId);

    // 4. Build the tree
    const result: Category[] = parents.map(parent => {
      const subcats = children
        .filter(child => child.parentId === parent.id)
        .map(child => {
          // If description is present, return object, else string
          if (child.description) {
            return {
              name: child.name,
              description: child.description,
            } as Subcategory;
          } else {
            return child.name;
          }
        });

      return {
        category: parent.name,
        description: parent.description || undefined,
        subcategories: subcats,
      };
    });

    return result;
  }
}
