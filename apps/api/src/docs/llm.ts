import type { OpenAPIHono } from "@hono/zod-openapi";
import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import { OPENAPI_INFO, OPENAPI_SERVERS, OPENAPI_VERSION } from "./config";

export function registerLlmDocs(app: OpenAPIHono) {
  app.get("/llms.txt", async (c) => {
    const document = app.getOpenAPI31Document({
      openapi: OPENAPI_VERSION,
      info: OPENAPI_INFO,
      servers: OPENAPI_SERVERS,
    });

    const markdown = await createMarkdownFromOpenApi(JSON.stringify(document, null, 2));

    return c.text(markdown);
  });
}
