import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3010),
    RESOURCE_API_BASE_PATH: z.string().default("/api/v1/resource"),
    OPENROUTER_API_KEY: z.string().min(5),
    JWKS_URL: z.url(),
    JWT_ISSUER: z.url(),
    JWT_AUDIENCE: z.url(),
    OPENAPI_SERVER_URLS: z.string().transform((value) =>
      value
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => new URL(url).toString()),
    ),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
