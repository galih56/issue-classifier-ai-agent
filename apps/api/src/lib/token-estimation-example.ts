import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { encoding_for_model } from "tiktoken";

// Types for better type safety
interface Subcategory {
  name?: string;
  description?: string;
}

interface Category {
  category: string;
  description?: string;
  subcategories: (string | Subcategory)[];
}

interface ClassificationResult {
  category: string;
  subcategory: string;
  reason: string;
}

interface TokenEstimation {
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

interface ClassificationResponse {
  result: ClassificationResult;
  tokenUsage: TokenEstimation;
}

// Model pricing (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "mistralai/mistral-nemo:free": { input: 0, output: 0 },
  "deepseek/deepseek-chat-v3-0324:free": { input: 0, output: 0 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  "gpt-4": { input: 30, output: 60 },
  "gpt-4-turbo": { input: 10, output: 30 },
  // Add more models as needed
};

/**
 * Estimates token count for a given text
 * Uses tiktoken for accurate estimation
 */
function estimateTokens(text: string, model: string = "gpt-3.5-turbo"): number {
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
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = MODEL_PRICING[model] || { input: 0, output: 0 };
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Formats categories for the prompt
 */
function formatCategories(collections: Category[]): string {
  return collections
    .map((cat) => {
      const subcats = cat.subcategories
        .map((sub) => {
          if (typeof sub === "string") {
            return `  - ${sub}`;
          } else {
            return `  - ${sub.name}: ${sub.description}`;
          }
        })
        .join("\n");
      
      const description = cat.description ? `\n${cat.description}\n` : "";
      return `${cat.category}:${description}${subcats}`;
    })
    .join("\n\n");
}

/**
 * Main classification function with token estimation
 * @param input - The issue description to classify
 * @param categories - Array of category objects
 * @param apiKey - API key for the model
 * @param model - Model name to use
 * @param baseURL - Base URL for the API (optional)
 */
export async function classifyIssue(
  input: string,
  categories: Category[],
  apiKey: string,
  model: string = "mistralai/mistral-nemo:free",
  baseURL?: string
): Promise<ClassificationResponse> {
  
  const llm = new ChatOpenAI({
    apiKey,
    model,
    configuration: baseURL ? { baseURL } : undefined,
  });

  const prompt = new PromptTemplate({
    template: `You are an AI issue classification assistant.

Your goal:
Read the issue description below and choose the *most relevant* category and subcategory
from the predefined list.

Predefined categories and subcategories:
{categories}

Issue description:
{text}

Return your response as valid JSON only (no markdown, no explanations):
{{
  "category": "<category name>",
  "subcategory": "<subcategory name>",
  "reason": "<short reasoning why you chose this category>"
}}`,
    inputVariables: ["text", "categories"],
  });

  // Format categories and build full prompt
  const formattedCategories = formatCategories(categories);
  const fullPrompt = await prompt.format({
    text: input,
    categories: formattedCategories,
  });

  // Estimate input tokens
  const inputTokens = estimateTokens(fullPrompt, model);
  
  // Estimate output tokens (typical JSON response size)
  const estimatedOutputTokens = 150; // Adjust based on your typical response size

  // Calculate estimated cost
  const estimatedCost = calculateCost(inputTokens, estimatedOutputTokens, model);

  console.log("Token Estimation:");
  console.log(`- Input tokens: ${inputTokens}`);
  console.log(`- Estimated output tokens: ${estimatedOutputTokens}`);
  console.log(`- Total estimated tokens: ${inputTokens + estimatedOutputTokens}`);
  console.log(`- Estimated cost: $${estimatedCost.toFixed(6)}`);

  // Execute the chain
  const chain = prompt.pipe(llm);
  const response = await chain.invoke({
    text: input,
    categories: formattedCategories,
  });

  // Extract content
  let content: string;
  if (typeof response === "string") {
    content = response;
  } else if (Array.isArray(response.content)) {
    content = response.content.map((c) => c.text).join("");
  } else {
    content = response.content as string;
  }

  // Calculate actual output tokens
  const actualOutputTokens = estimateTokens(content, model);
  const actualCost = calculateCost(inputTokens, actualOutputTokens, model);

  console.log("\nActual Usage:");
  console.log(`- Output tokens: ${actualOutputTokens}`);
  console.log(`- Total tokens: ${inputTokens + actualOutputTokens}`);
  console.log(`- Actual cost: $${actualCost.toFixed(6)}`);

  // Parse JSON response
  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleaned);

    return {
      result,
      tokenUsage: {
        inputTokens,
        estimatedOutputTokens: actualOutputTokens,
        totalTokens: inputTokens + actualOutputTokens,
        estimatedCost: actualCost,
      },
    };
  } catch (error) {
    console.error("Failed to parse LLM response:", content);
    throw new Error("LLM returned invalid JSON");
  }
}

/**
 * Batch classification with aggregated cost estimation
 */
export async function classifyBatch(
  inputs: string[],
  categories: Category[],
  apiKey: string,
  model: string = "mistralai/mistral-nemo:free",
  baseURL?: string
): Promise<{
  results: ClassificationResponse[];
  totalCost: number;
  totalTokens: number;
}> {
  const results: ClassificationResponse[] = [];
  let totalCost = 0;
  let totalTokens = 0;

  for (const input of inputs) {
    const response = await classifyIssue(input, categories, apiKey, model, baseURL);
    results.push(response);
    totalCost += response.tokenUsage.estimatedCost;
    totalTokens += response.tokenUsage.totalTokens;
  }

  console.log("\n=== Batch Summary ===");
  console.log(`Total items processed: ${inputs.length}`);
  console.log(`Total tokens used: ${totalTokens}`);
  console.log(`Total cost: $${totalCost.toFixed(6)}`);
  console.log(`Average cost per item: $${(totalCost / inputs.length).toFixed(6)}`);

  return { results, totalCost, totalTokens };
}

// Example usage:
/*
import { classifyIssue, classifyBatch } from './classifier';

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