import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Environment variable validation for the docs app.
 *
 * Usage:
 * ```ts
 * import { env } from "@/lib/env";
 * console.log(env.NEXT_PUBLIC_SITE_URL); // Type-safe and validated
 * ```
 */
export const env = createEnv({
  client: {
    NEXT_PUBLIC_SITE_URL: z
      .url()
      .default("http://localhost:3000")
      .describe("Base URL for the docs site"),
    NEXT_PUBLIC_GITHUB_REPO_URL: z
      .string()
      .default("https://github.com/yurisasc/starter-kit")
      .describe("GitHub repository URL for the project"),
  },
  server: {},
  clientPrefix: "NEXT_PUBLIC_",
  runtimeEnv: process.env,
  skipValidation: false,
  emptyStringAsUndefined: true,
});

export type Env = typeof env;
