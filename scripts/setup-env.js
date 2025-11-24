#!/usr/bin/env node

/**
 * Environment Setup Script
 *
 * This script automatically sets up all required environment files
 * by copying .env.example files and generating secure secrets where needed.
 *
 * Usage: pnpm setup:env
 */

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT_DIR = process.cwd();

const ENV_FILES = [
  {
    source: "apps/auth/.env.example",
    target: "apps/auth/.env",
    transform: (content) => {
      // Generate secure secret for auth server using Node.js crypto
      const secret = randomBytes(32).toString("base64");
      return content.replace(
        "BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long-change-this-in-production",
        `BETTER_AUTH_SECRET=${secret}`,
      );
    },
  },
  {
    source: "apps/api/.env.example",
    target: "apps/api/.env",
  },
  {
    source: "apps/docs/.env.example",
    target: "apps/docs/.env",
  },
  {
    source: "packages/database/.env.example",
    target: "packages/database/.env",
  },
];

function setupEnvironment() {
  console.log("🔧 Setting up environment files...\n");

  let createdCount = 0;

  for (const { source, target, transform } of ENV_FILES) {
    const sourcePath = join(ROOT_DIR, source);
    const targetPath = join(ROOT_DIR, target);

    if (!existsSync(sourcePath)) {
      console.log(`⚠️  Source file not found: ${source}`);
      continue;
    }

    if (existsSync(targetPath)) {
      console.log(`⏭️  Skipping ${target} (already exists)`);
      continue;
    }

    try {
      let content = readFileSync(sourcePath, "utf8");

      if (transform) {
        content = transform(content);
      }

      writeFileSync(targetPath, content);
      console.log(`✅ Created ${target}`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating ${target}:`, error.message);
    }
  }

  console.log(`\n🎉 Environment setup complete! ${createdCount} files created.`);
  console.log("📋 Next steps:");
  console.log(
    "   1. Start the database: docker run -d --name auth-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=auth_db -p 5432:5432 postgres:18",
  );
  console.log("   2. Run: pnpm db:setup");
  console.log("   3. Start development: pnpm dev");
}

setupEnvironment();
