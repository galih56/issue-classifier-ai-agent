// Configuration and constants

import { ModelPricing } from './types';

// Model pricing (per 1M tokens)
export const MODEL_PRICING: Record<string, ModelPricing> = {
  "mistralai/mistral-nemo:free": { input: 0, output: 0 },
  "deepseek/deepseek-chat-v3-0324:free": { input: 0, output: 0 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  "gpt-4": { input: 30, output: 60 },
  "gpt-4-turbo": { input: 10, output: 30 },
  // Add more models as needed
};

// Default estimation for output tokens
export const DEFAULT_OUTPUT_TOKEN_ESTIMATE = 150;