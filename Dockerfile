# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace configuration
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy package.json files for all workspaces
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies first
RUN pnpm install --frozen-lockfile

# Copy source code after install
COPY apps/api ./apps/api
COPY packages ./packages

# Build API
RUN pnpm --filter @repo/api build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy packages source (database package needs source at runtime for Drizzle)
COPY --from=builder /app/packages ./packages

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies and ignore scripts (prevents husky error)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

# Run from workspace root
WORKDIR /app
CMD ["pnpm", "--filter", "@repo/api", "start"]