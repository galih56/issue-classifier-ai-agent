import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { env } from "../env";

export async function summarizeText(input: string) {
  const model = new ChatOpenAI({
    apiKey: env.OPENROUTER_API_KEY!,
    model: "mistralai/mistral-7b-instruct:free", 
    // model: "deepseek/deepseek-chat-v3-0324:free", 
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });

  const prompt = new PromptTemplate({
    template: `
      You are an AI issue classification assistant for HR systems.

      Your goal:
      Read the issue description below and choose the *most relevant* category and subcategory
      from the predefined list.

      Predefined categories and subcategories:
      {categories}

      Issue description:
      {text}

      Return your response as valid JSON:
      {{
        "category": "<category name>",
        "subcategory": "<subcategory name>",
        "reason": "<short reasoning why you chose this category>"
      }}
    `,
    inputVariables: ["text"],
  });

  const chain = prompt.pipe(model);
  const response = await chain.invoke({ text: input });

  if (typeof response === "string") return response;
  if (Array.isArray(response.content)) {
    return response.content.map((c) => c.text).join("");
  }
  return response.content;
}

