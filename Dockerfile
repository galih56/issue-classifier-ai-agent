# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace configuration
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy all package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy source code BEFORE install (needed for postinstall scripts)
COPY apps ./apps
COPY packages ./packages

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# Build everything to ensure all dependencies are built
RUN pnpm --filter @repo/api build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy ALL package.json files (needed for workspace resolution)
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy the entire packages directory (source code, not just package.json)
COPY --from=builder /app/packages ./packages

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

# Start from the root, not from apps/api
CMD ["pnpm", "--filter", "@repo/api", "start"]