import { getCategoriesByCollection } from "@repo/database/repositories";
import type { Category } from "@repo/database/types";

/**
 * Fetches categories and subcategories from the database for the "HR Issues" collection.
 * Reconstructs the tree structure required by the classifier.
 */
export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    return getCategoriesByCollection("HR Issues");
  }
}
