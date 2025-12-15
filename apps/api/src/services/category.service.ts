import {
  getAllCollections,
  getCollectionById,
  getCollectionByName,
  createCollection,
  updateCollection,
  deleteCollection,
  getCategoriesByCollectionId,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByCollection,
} from "@repo/database/repositories";
import type { Category } from "@repo/database/types";

/**
 * Service for managing collections and categories
 */
export class CategoryService {
  // ============================================
  // COLLECTIONS
  // ============================================

  static async getAllCollections() {
    return getAllCollections();
  }

  static async getCollectionById(id: string) {
    return getCollectionById(id);
  }

  static async getCollectionByName(name: string) {
    return getCollectionByName(name);
  }

  static async createCollection(data: {
    name: string;
    description?: string;
    workspaceId?: string;
  }) {
    return createCollection(data);
  }

  static async updateCollection(
    id: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    return updateCollection(id, data);
  }

  static async deleteCollection(id: string) {
    return deleteCollection(id);
  }

  // ============================================
  // CATEGORIES
  // ============================================

  static async getCategoriesByCollectionId(collectionId: string) {
    return getCategoriesByCollectionId(collectionId);
  }

  static async getCategoryById(id: string) {
    return getCategoryById(id);
  }

  static async createCategory(data: {
    collectionId: string;
    name: string;
    description?: string;
    parentId?: string;
    orderIndex?: number;
  }) {
    return createCategory(data);
  }

  static async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
      orderIndex?: number;
    }
  ) {
    return updateCategory(id, data);
  }

  static async deleteCategory(id: string) {
    return deleteCategory(id);
  }

  // ============================================
  // LEGACY METHODS (for classifier)
  // ============================================

  /**
   * Fetches categories and subcategories from the database for the "HR Issues" collection.
   * Reconstructs the tree structure required by the classifier.
   */
  static async getCategories(): Promise<Category[]> {
    return getCategoriesByCollection("HR Issues");
  }
}
