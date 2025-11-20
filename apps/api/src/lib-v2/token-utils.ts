import { encoding_for_model } from "tiktoken";
import { MODEL_PRICING } from './config';

/**
 * Estimates token count for a given text
 * Uses tiktoken for accurate estimation
 */
export function estimateTokens(text: string, model: string = "gpt-3.5-turbo"): number {
  try {
    // Map model names to tiktoken encoding
    const encodingModel = model.includes("gpt-4") ? "gpt-4" : "gpt-3.5-turbo";
    const encoder = encoding_for_model(encodingModel as any);
    const tokens = encoder.encode(text);
    encoder.free();
    return tokens.length;
  } catch (error) {
    // Fallback: rough estimation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}

/**
 * Calculates estimated cost based on token usage and model pricing
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = MODEL_PRICING[model] || { input: 0, output: 0 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}