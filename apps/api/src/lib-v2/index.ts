// index.ts
// Main entry point - exports public API

export { classifyIssue, classifyBatch } from './classifier';
export type { 
  Category, 
  Subcategory, 
  ClassificationResult, 
  ClassificationResponse,
  TokenEstimation,
  BatchResult 
} from './types';
export { MODEL_PRICING } from './config';

// Example usage:
/*
import { classifyIssue, classifyBatch } from './index';

// Single classification
const result = await classifyIssue(
  "User cannot log into the system",
  categories,
  process.env.API_KEY!,
  "gpt-3.5-turbo"
);

console.log(result.result);
console.log(`Cost: $${result.tokenUsage.estimatedCost}`);

// Batch classification
const batchResults = await classifyBatch(
  ["Issue 1", "Issue 2", "Issue 3"],
  categories,
  process.env.API_KEY!,
  "gpt-3.5-turbo"
);
*/