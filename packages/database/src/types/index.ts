/**
 * Database repository types
 */

/**
 * Subcategory can be either a string or an object with name and description
 */
export type Subcategory = string | {
  name: string;
  description: string;
};

/**
 * Category with its subcategories
 */
export interface Category {
  category: string;
  description?: string;
  subcategories: Subcategory[];
}

/**
 * Raw database collection category record
 */
export interface CollectionCategoryRecord {
  id: string;
  collectionId: string;
  name: string;
  description: string | null;
  parentId: string | null;
  orderIndex: number | null;
  createdAt: Date;
}
