import { ClassificationResult } from './types';

/**
 * Extracts text content from various LLM response formats
 */
export function extractContent(response: any): string {
  if (typeof response === "string") {
    return response;
  } else if (Array.isArray(response.content)) {
    return response.content.map((c: any) => c.text).join("");
  } else {
    return response.content as string;
  }
}

/**
 * Parses the LLM response into a ClassificationResult
 * @throws Error if the response is not valid JSON
 */
export function parseClassificationResponse(content: string): ClassificationResult {
  try {
    // Try to find the JSON object within the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: Try cleaning markdown code blocks (existing logic)
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse LLM response:", content);
    throw new Error("LLM returned invalid JSON");
  }
}