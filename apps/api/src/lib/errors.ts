import { z } from "@hono/zod-openapi";
import type { Context } from "hono";

export const ErrorResponseSchema = z
  .object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
  })
  .openapi("ErrorResponse", {
    example: {
      code: "unauthorized",
      message: "Invalid or expired token",
    },
  });

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export function unauthorized(
  c: Context,
  message = "Invalid or expired token",
  details?: Record<string, unknown>,
): Response {
  return c.json<ErrorResponse>(
    {
      code: "unauthorized",
      message,
      ...(details && { details }),
    },
    401,
  );
}

export function forbidden(
  c: Context,
  message = "Insufficient permissions",
  details?: Record<string, unknown>,
): Response {
  return c.json<ErrorResponse>(
    {
      code: "forbidden",
      message,
      ...(details && { details }),
    },
    403,
  );
}

export function badRequest(
  c: Context,
  message: string,
  details?: Record<string, unknown>,
): Response {
  return c.json<ErrorResponse>(
    {
      code: "bad_request",
      message,
      ...(details && { details }),
    },
    400,
  );
}
