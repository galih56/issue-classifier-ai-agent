import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createOpenAPIApp } from "./docs/scalar";
import { env } from "./env";
import { registerPublicRoutes } from "./routes/public";
import { registerTimeRoutes } from "./routes/time";
import { registerIssueClassifierRoutes } from "./routes/issue-classification";
import { registerUserRoutes } from "./routes/users";
import { registerCategoryRoutes } from "./routes/categories";
import { registerWorkspaceRoutes } from "./routes/workspaces";

const apiApp = createOpenAPIApp();

// CORS middleware - restrict to allowed origins
apiApp.use(
  "*",
  cors({
    origin: (origin) => {
      // Check if origin is in allowed list
      if (env.ALLOWED_ORIGINS.includes(origin)) {
        return origin;
      }
      
      // Reject other origins
      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    maxAge: 600, // 10 minutes
  })
);


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
registerIssueClassifierRoutes(apiApp);
registerUserRoutes(apiApp);
registerCategoryRoutes(apiApp);
registerWorkspaceRoutes(apiApp);

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
