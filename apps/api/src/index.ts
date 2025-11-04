import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { registerLlmDocs } from "./docs/llm";
import { createOpenAPIApp } from "./docs/scalar";
import { env } from "./env";
import { registerPublicRoutes } from "./routes/public";
import { registerTimeRoutes } from "./routes/time";

const apiApp = createOpenAPIApp();
registerLlmDocs(apiApp);

// Health check
apiApp.get("/health", (c) => {
  return c.json({ status: "healthy" }, 200);
});

// Register security scheme for bearer auth
apiApp.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Register routes
registerPublicRoutes(apiApp);
registerTimeRoutes(apiApp);

// 404 handler
apiApp.notFound((c) => {
  return c.json({ code: "not_found", message: "Route not found" }, 404);
});

const app = new Hono();
app.route(env.RESOURCE_API_BASE_PATH, apiApp);

const port = env.PORT;
console.log(`Server is running on http://localhost:${port}`);
console.log(
  `API docs available at http://localhost:${port}${env.RESOURCE_API_BASE_PATH}/reference`,
);

serve({
  fetch: app.fetch,
  port,
});
