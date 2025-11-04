import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit CLI Configuration
 *
 * ⚠️ IMPORTANT: This config is ONLY for CLI tools, NOT for runtime application code.
 *
 * CLI Usage:
 * - `pnpm db:generate` - Generate SQL migration files from schema changes
 * - `pnpm db:migrate` - Apply migrations to the database
 * - `pnpm db:studio` - Open Drizzle Studio database GUI
 *
 * Environment Variables (CLI Only):
 * - DATABASE_URL is required and configured via Turborepo's env handling
 * - Turborepo passes environment variables to package tasks (see turbo.json)
 * - Can be set in root .env or apps/auth/.env
 *
 * Runtime Application Code:
 * - Applications use `createDbClient(connectionString)` from src/client.ts
 * - Apps validate and pass connection strings (no env access in package code)
 *
 * Schema Files:
 * - ./src/schema/index.ts - Consolidated schema file
 *
 * Migrations are generated from schema files.
 */
export default defineConfig({
  out: "./drizzle/migrations",
  schema: ["./src/schema/index.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
