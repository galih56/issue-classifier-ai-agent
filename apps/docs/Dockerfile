# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy source code (docs needs it for postinstall)
COPY apps/docs ./apps/docs
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build only docs
RUN pnpm --filter @repo/docs build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY apps/docs/package.json ./apps/docs/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy source for packages
COPY packages ./packages

# Copy built docs
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

WORKDIR /app/apps/docs
CMD ["pnpm", "start"]