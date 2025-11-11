import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { env } from "../env";

const collections = [
  {
    "category": "Payroll",
    "subcategories": [
      "Salary deduction",
      "Overtime payment",
      "Bonus / incentive",
      "Payslip request",
      "Tax / BPJS"
    ]
  },
  {
    "category": "Attendance",
    "subcategories": [
      "Missing clock-in/out",
      "Leave approval",
      "Shift schedule",
      "Late attendance",
      "Correction request"
    ]
  },
  {
    "category": "Employment",
    "subcategories": [
      "Contract status",
      "Promotion / demotion",
      "Transfer request",
      "Resignation / termination",
      "Onboarding process"
    ]
  },
  {
    "category": "Benefits",
    "subcategories": [
      "Medical claim",
      "Insurance coverage",
      "Annual leave quota",
      "Training / course request",
      "Company facility"
    ]
  },
  {
    "category": "System Access",
    "description": "Covers all issues related to accessing and using internal HR systems or apps.",
    "subcategories": [
      {
        "name": "Email account issue",
        "description": "Problems with email setup, login, or company email credentials."
      },
      {
        "name": "HRIS login problem",
        "description": "User cannot log into GreatDay or HR system, forgot password, or sees login failure."
      },
      {
        "name": "Access permission request",
        "description": "Requesting access to a module, report, or feature not yet available to the user."
      },
      {
        "name": "Password reset",
        "description": "Reset or unlock password for system account."
      },
      {
        "name": "System error report",
        "description": "System shows an error message, crash, or numeric/technical error (e.g. NaN, 500, 404)."
      },
      {
        "name": "Application malfunction",
        "description": "Form or button not functioning correctly without showing explicit error."
      }
    ]
  },
  {
    "category": "General Inquiry",
    "subcategories": [
      "Policy clarification",
      "Document request",
      "Event participation",
      "Internal memo",
      "Feedback / suggestion"
    ]
  }
];

// Helper function to format categories for the prompt
function formatCategories(collections: any): string {
  return collections
    .map((cat : any) => {
      const subcats = cat.subcategories
        .map((sub : any) => {
          if (typeof sub === "string") {
            return `  - ${sub}`;
          } else {
            return `  - ${sub.name}: ${sub.description}`;
          }
        })
        .join("\n");
      
      return `${cat.category}:\n${subcats}`;
    })
    .join("\n\n");
}

export async function classifyIssue(input: string) {
  const model = new ChatOpenAI({
    apiKey: env.OPENROUTER_API_KEY!,
    model: "mistralai/mistral-nemo:free", 
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

      Return your response as valid JSON only (no markdown, no explanations):
      {{
        "category": "<category name>",
        "subcategory": "<subcategory name>",
        "reason": "<short reasoning why you chose this category>"
      }}`,
    inputVariables: ["text", "categories"], // ADD categories here
  });

  const chain = prompt.pipe(model);
  
  const formattedCategories = formatCategories(collections);
  
  const response = await chain.invoke({ 
    text: input,
    categories: formattedCategories  // PASS it here
  });

  let content: string;
  if (typeof response === "string") {
    content = response;
  } else if (Array.isArray(response.content)) {
    content = response.content.map((c) => c.text).join("");
  } else {
    content = response.content as string;
  }

  // Parse JSON response
  try {
    // Remove markdown code blocks if present
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse LLM response:", content);
    throw new Error("LLM returned invalid JSON");
  }
}

/*
  Input Example : 

  When the user tries to submit their on-duty realization form, they encounter an issue with the date input. Initially, the date field appears correct, displaying the proper format and value. However, after clicking the Submit button, the field suddenly shows NaN/NaN/NaN, and the submission process fails. The user is unable to proceed even though all required fields appear filled correctly.
  \n\n
  The form also includes inputs for three days of living expenses, but in this case, the user didn’t spend anything because they stayed with their cousin in the same city. The confusion begins when the user attempts to finalize the realization but nothing happens — no success message, no error alert — leaving the impression that the form submission is broken.
  \n\n
  The user cannot submit their on-duty realization form because a date formatting error causes the date field to display NaN/NaN/NaN upon submission.
*/