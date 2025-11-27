import { ChatOpenAI } from "@langchain/openai";
import { 
  Category, 
  ClassificationResponse, 
  BatchResult 
} from './types';
import { DEFAULT_OUTPUT_TOKEN_ESTIMATE } from './config';
import { estimateTokens, calculateCost } from './token-utils';
import { formatCategories, createClassificationPrompt } from './prompt-utils';
import { extractContent, parseClassificationResponse } from './response-parser';
import { logTokenEstimation, logActualUsage, logBatchSummary } from './logger';

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
  model: string = "mistralai/mistral-7b-instruct:free",
  baseURL?: string
): Promise<ClassificationResponse> {
  
  const llm = new ChatOpenAI({
    apiKey,
    model,
    configuration: baseURL ? { baseURL } : undefined,
  });

  const prompt = createClassificationPrompt();

  // Format categories and build full prompt
  const formattedCategories = formatCategories(categories);
  const fullPrompt = await prompt.format({
    text: input,
    categories: formattedCategories,
  });

  // Estimate input tokens
  const inputTokens = estimateTokens(fullPrompt, model);
  
  // Estimate output tokens
  const estimatedOutputTokens = DEFAULT_OUTPUT_TOKEN_ESTIMATE;

  // Calculate estimated cost
  const estimatedCost = calculateCost(inputTokens, estimatedOutputTokens, model);

  logTokenEstimation(inputTokens, estimatedOutputTokens, estimatedCost);

  // Execute the chain
  const chain = prompt.pipe(llm);
  const response = await chain.invoke({
    text: input,
    categories: formattedCategories,
  });

  // Extract and parse content
  const content = extractContent(response);
  const actualOutputTokens = estimateTokens(content, model);
  const actualCost = calculateCost(inputTokens, actualOutputTokens, model);

  logActualUsage(inputTokens, actualOutputTokens, actualCost);

  const result = parseClassificationResponse(content);
  
  return {
    result,
    tokenUsage: {
      inputTokens,
      estimatedOutputTokens: actualOutputTokens,
      totalTokens: inputTokens + actualOutputTokens,
      estimatedCost: actualCost,
    },
  };
}

/**
 * Batch classification with aggregated cost estimation
 */
export async function classifyBatch(
  inputs: string[],
  categories: Category[],
  apiKey: string,
  model: string = "mistralai/mistral-7b-instruct:free",
  baseURL?: string
): Promise<BatchResult> {
  const results: ClassificationResponse[] = [];
  let totalCost = 0;
  let totalTokens = 0;

  for (const input of inputs) {
    const response = await classifyIssue(input, categories, apiKey, model, baseURL);
    results.push(response);
    totalCost += response.tokenUsage.estimatedCost;
    totalTokens += response.tokenUsage.totalTokens;
  }

  logBatchSummary(inputs.length, totalTokens, totalCost);

  return { results, totalCost, totalTokens };
}