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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages

# Build only web
RUN pnpm --filter @repo/web build

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy source for packages
COPY packages ./packages

# Copy built web app
COPY --from=builder /app/apps/web/.output ./apps/web/.output

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["node", ".output/server/index.mjs"]