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
    OPENAPI_SERVER_URLS: z
      .string()
        .refine(
          (value) => {
            const urls = value.split(",").map(s => s.trim()).filter(Boolean);
            return urls.every(url => url.startsWith('http://') || url.startsWith('https://'));
          },
          {
            message: 
              "All URLs must include protocol (http:// or https://). " +
              "Example: https://api.example.com,http://localhost:3010"
          }
        )
        .transform((value) =>
          value
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
        )
      .pipe(z.array(z.string().url())),
    ALLOWED_ORIGINS: z
      .string()
      .default("http://localhost:3000")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean)
      )
      .pipe(z.array(z.string())),
    DATABASE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
