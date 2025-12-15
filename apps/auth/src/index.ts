import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { AUTH_API_BASE_PATH } from "./config/api";
import { env } from "./env";
import { auth } from "./lib/auth";

/**
 * Auth Server - Hono Application
 *
 * Features:
 * - Better-auth integration for authentication
 * - CORS support for cross-origin requests
 * - Request logging
 * - Health check endpoint
 * - Centralized error handling
 */

const app = new Hono();

// Middleware: Request logging
app.use("*", logger());

// Middleware: CORS
app.use(
  "*",
  cors({
    origin: [env.BETTER_AUTH_URL, "http://localhost:3000"],
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Fallback: forward any other /api/v1/auth/* routes to Better Auth handler
app.all(`${AUTH_API_BASE_PATH}/*`, (c) => auth.handler(c.req.raw));

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: `Route ${c.req.method} ${c.req.path} not found`,
      timestamp: new Date().toISOString(),
    },
    404,
  );
});

// Global error handler
app.onError((err, c) => {
  console.error("Server error:", err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
        timestamp: new Date().toISOString(),
      },
      err.status,
    );
  }

  return c.json(
    {
      error: "Internal Server Error",
      message: env.NODE_ENV === "development" ? err.message : "Something went wrong",
      timestamp: new Date().toISOString(),
    },
    500,
  );
});

// Start server
const port = env.PORT;

console.log(`🚀 Auth server starting on port ${port}...`);
console.log(`📍 Environment: ${env.NODE_ENV}`);
console.log(`🔗 Auth URL: ${env.BETTER_AUTH_URL}`);

// Run server with Node.js
serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server listening on http://localhost:${port}`);
