import * as schema from "@repo/database/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt, openAPI } from "better-auth/plugins";
import { AUTH_API_BASE_PATH } from "../config/api";
import { env } from "../env";
import { db } from "./db";

/**
 * Better Auth instance for the auth server.
 *
 * Configuration:
 * - Uses Drizzle adapter with PostgreSQL
 * - Email/password authentication enabled
 * - Session management with cookie-based sessions
 * - CSRF protection enabled (built-in)
 *
 * Schema Generation:
 * - Run `pnpm dlx @better-auth/cli generate` to create/update database schema
 * - Schema is generated to ../../packages/database/drizzle/schema.ts
 * - After generation, run migrations from the database package
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  /**
   * Database configuration
   * Uses the Drizzle adapter with our database client
   */
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  user : {
    modelName: "users",
  },

  account : {
    modelName: "accounts",
  },

  verification : {
    modelName: "verifications",
  },

  /**
   * Email and password authentication
   */
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign in after registration
  },

  /**
   * Session configuration
   */
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
  },

  /**
   * Base URL and secret from validated environment
   */
  baseURL: env.BETTER_AUTH_URL,
  basePath: AUTH_API_BASE_PATH,
  secret: env.BETTER_AUTH_SECRET,

  /**
   * Advanced configuration
   */
  advanced: {
    /**
     * Database ID generation
     */
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },

  /**
   * User configuration
   *
   * Example: Adding custom fields to the user table
   * user: {
   *   additionalFields: {
   *     role: {
   *       type: "string",
   *       required: false,
   *       defaultValue: "user",
   *     },
   *   },
   * },
   */

  /**
   * Plugins configuration
   *
   * Better Auth supports plugins for additional features like:
   * - Two-factor authentication
   * - Magic link
   * - Passkey
   * - Email OTP
   * - Username authentication
   *
   * Example: Adding two-factor authentication plugin
   * Import: import { twoFactor } from "better-auth/plugins";
   *
   * plugins: [
   *   twoFactor({
   *     issuer: "YourApp",
   *     totpOptions: {
   *       period: 30,
   *     },
   *   }),
   * ],
   *
   * After adding a plugin:
   * 1. Run `pnpm db:schema` to regenerate auth schema with plugin tables
   * 2. Run `pnpm db:generate` to create migration for new tables
   * 3. Run `pnpm db:migrate` to apply the migration
   *
   * Plugin tables will be automatically added to the schema and migrated.
   */
  plugins: [
    openAPI(),
    /**
     * JWT plugin for issuing access tokens to backend services
     * Exposes /api/v1/auth/token and /api/v1/auth/jwks endpoints
     */
    jwt({
      jwt: {
        /**
         * Define minimal JWT payload (id, email only)
         */
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
        }),
        /**
         * Short-lived tokens: 15 minutes per spec
         */
        expirationTime: "15m",
      },
    }),
  ],
});

// Export types for use in the application
// Explicit type to avoid jose dependency leaking into the type signature
export type Auth = ReturnType<typeof betterAuth>;
