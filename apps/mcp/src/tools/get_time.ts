import { callResourceAPI, ResourceClientError } from "../lib/client";

export const getTimeTool = {
  name: "get_time",
  description:
    "Get the current server time (requires JWT authentication, passed via client request or MCP_AUTH_JWT environment variable)",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export async function handleGetTime(jwt?: string) {
  try {
    const result = await callResourceAPI<{ epoch: number; iso: string }>("time", { jwt });

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
