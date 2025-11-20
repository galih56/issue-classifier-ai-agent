// Prompt formatting utilities

import { PromptTemplate } from "@langchain/core/prompts";
import { Category, Subcategory } from './types';

/**
 * Formats categories for the prompt
 */
export function formatCategories(collections: Category[]): string {
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
 * Creates the classification prompt template
 */
export function createClassificationPrompt(): PromptTemplate {
  return new PromptTemplate({
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
}