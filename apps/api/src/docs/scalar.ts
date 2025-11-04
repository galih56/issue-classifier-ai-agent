import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { env } from "../env";
import { OPENAPI_INFO, OPENAPI_SERVERS, OPENAPI_VERSION } from "./config";

export function createOpenAPIApp() {
  const app = new OpenAPIHono();

  const openApiJsonPath = "/reference/openapi.json";

  // Add OpenAPI documentation endpoint
  app.doc(openApiJsonPath, {
    openapi: OPENAPI_VERSION,
    info: OPENAPI_INFO,
    servers: OPENAPI_SERVERS,
  });

  // Mount Scalar UI
  app.get("/reference", Scalar({ url: `${env.RESOURCE_API_BASE_PATH}${openApiJsonPath}` }));

  return app;
}
