import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESOURCE_BASE_URL: z.url(),
    MCP_AUTH_JWT: z.string().optional(),
    MCP_SERVER_PORT: z.coerce.number().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
