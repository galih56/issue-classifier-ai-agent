// Logging utilities for token usage and costs

import { TokenEstimation } from './types';

/**
 * Logs token estimation before API call
 */
export function logTokenEstimation(
  inputTokens: number,
  estimatedOutputTokens: number,
  estimatedCost: number
): void {
  console.log("Token Estimation:");
  console.log(`- Input tokens: ${inputTokens}`);
  console.log(`- Estimated output tokens: ${estimatedOutputTokens}`);
  console.log(`- Total estimated tokens: ${inputTokens + estimatedOutputTokens}`);
  console.log(`- Estimated cost: $${estimatedCost.toFixed(6)}`);
}

/**
 * Logs actual token usage after API call
 */
export function logActualUsage(
  inputTokens: number,
  outputTokens: number,
  actualCost: number
): void {
  console.log("\nActual Usage:");
  console.log(`- Output tokens: ${outputTokens}`);
  console.log(`- Total tokens: ${inputTokens + outputTokens}`);
  console.log(`- Actual cost: $${actualCost.toFixed(6)}`);
}

/**
 * Logs batch processing summary
 */
export function logBatchSummary(
  itemCount: number,
  totalTokens: number,
  totalCost: number
): void {
  console.log("\n=== Batch Summary ===");
  console.log(`Total items processed: ${itemCount}`);
  console.log(`Total tokens used: ${totalTokens}`);
  console.log(`Total cost: $${totalCost.toFixed(6)}`);
  console.log(`Average cost per item: $${(totalCost / itemCount).toFixed(6)}`);
}