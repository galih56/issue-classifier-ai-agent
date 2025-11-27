export interface Subcategory {
  name?: string;
  description?: string;
}

export interface Category {
  category: string;
  description?: string;
  subcategories: (string | Subcategory)[];
}

export interface ClassificationResult {
  category: string;
  subcategory: string;
  reason: string;
}

export interface TokenEstimation {
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ClassificationResponse {
  result: ClassificationResult;
  tokenUsage: TokenEstimation;
}

export interface BatchResult {
  results: ClassificationResponse[];
  totalCost: number;
  totalTokens: number;
}

export interface ModelPricing {
  input: number;
  output: number;
}