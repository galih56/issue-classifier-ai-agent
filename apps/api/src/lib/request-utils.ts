import type { Context } from "hono";

/**
 * Parses the request body based on the Content-Type header.
 * Supports application/json, application/x-www-form-urlencoded, and multipart/form-data.
 * 
 * @param c Hono Context
 * @returns The parsed body as an object
 * @throws Error if the Content-Type is not supported
 */
export async function parseRequestBody(c: Context): Promise<any> {
  const contentType = c.req.header("content-type") || "";

  if (contentType.includes("application/json")) {
    return c.req.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    return c.req.parseBody();
  }

  throw new Error(
    "Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data"
  );
}
