import { env } from "../env";

export class ResourceClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ResourceClientError";
  }
}

export async function callResourceAPI<T = unknown>(
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    jwt?: string;
  } = {},
): Promise<T> {
  const url = new URL(path, env.RESOURCE_BASE_URL);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add JWT from parameter (HTTP transport) or fallback to env (stdio transport)
  const jwt = options.jwt || env.MCP_AUTH_JWT;
  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  try {
    const response = await fetch(url.toString(), {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      // Map HTTP errors to tool errors with standardized format
      const errorCode = (typeof data.code === "string" ? data.code : undefined) || "api_error";
      const errorMessage =
        (typeof data.message === "string" ? data.message : undefined) ||
        `API request failed with status ${response.status}`;

      throw new ResourceClientError(errorMessage, response.status, errorCode);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ResourceClientError) {
      throw error;
    }

    // Network or parsing errors
    throw new ResourceClientError(error instanceof Error ? error.message : "Unknown error");
  }
}
