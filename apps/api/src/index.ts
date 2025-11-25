import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { registerLlmDocs } from "./docs/llm";
import { createOpenAPIApp } from "./docs/scalar";
import { env } from "./env";
import { registerPublicRoutes } from "./routes/public";
import { registerTimeRoutes } from "./routes/time";
import { registerIssueClassifierRoutes } from "./routes/v1/issue-classification";
import { registerIssueClassifierRoutesV2 } from "./routes/v2/issue-classification";

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

// After registerTimeRoutes(apiApp);
registerIssueClassifierRoutes(apiApp);

// Register V2 routes
const v2App = createOpenAPIApp();
registerIssueClassifierRoutesV2(v2App);
apiApp.route("/v2", v2App);
// 404 handler
apiApp.notFound((c) => {
  return c.json({ code: "not_found", message: "Route not found" }, 404);
});

const app = new Hono();
app.route(env.RESOURCE_API_BASE_PATH, v2App);

const port = env.PORT;
console.log(`Server is running on http://localhost:${port}`);
console.log(
  `API docs available at http://localhost:${port}${env.RESOURCE_API_BASE_PATH}/reference`,
);

serve({
  fetch: app.fetch,
  port,
});
