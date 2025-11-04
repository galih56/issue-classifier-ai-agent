import { callResourceAPI, ResourceClientError } from "../lib/client";

export const getPublicStatusTool = {
  name: "get_public_status",
  description: "Get the public status from the resource server (no authentication required)",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export async function handleGetPublicStatus(jwt?: string) {
  try {
    const result = await callResourceAPI<{ status: string }>("public", { jwt });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof ResourceClientError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: error.code || "api_error",
                message: error.message,
                statusCode: error.statusCode,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: "unknown_error",
              message: error instanceof Error ? error.message : "Unknown error occurred",
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
}
