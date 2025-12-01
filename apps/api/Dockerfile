# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all package.json files for proper dependency resolution
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Build only the API
RUN pnpm --filter @repo/api build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy source for packages (needed at runtime)
COPY packages ./packages

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]