import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Environment variable validation for the auth server.
 *
 * Following Turborepo best practices, each app validates its own environment.
 * This provides:
 * - Type safety at compile time
 * - Runtime validation on startup
 * - Clear error messages for missing/invalid variables
 *
 * Usage:
 * ```ts
 * import { env } from "./env";
 * console.log(env.DATABASE_URL); // Type-safe and validated
 * ```
 */
export const env = createEnv({
  client: {},
  /**
   * Server-side environment variables.
   * These are validated at runtime and must be present.
   */
  server: {
    // Database
    DATABASE_URL: z.url().describe("PostgreSQL connection string"),

    // Better Auth
    BETTER_AUTH_SECRET: z
      .string()
      .min(32)
      .describe("Secret key for better-auth (min 32 characters)"),
    BETTER_AUTH_URL: z.url().describe("Base URL where auth server is accessible"),

    // Server
    PORT: z.coerce.number().positive().default(3000).describe("Server port"),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development")
      .describe("Runtime environment"),
  },

  /**
   * The prefix for client-side environment variables (if any).
   * Not used in this server-only app.
   */
  clientPrefix: "PUBLIC_",

  /**
   * Runtime environment variables.
   * This is where the actual values come from.
   */
  runtimeEnv: process.env,

  /**
   * Skip validation in development for faster startup.
   * Set to false to always validate (recommended for production).
   */
  skipValidation: false,

  /**
   * Makes the validation error messages more readable.
   */
  emptyStringAsUndefined: true,
});

// Export type for use in other modules
export type Env = typeof env;
