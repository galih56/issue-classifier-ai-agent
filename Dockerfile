# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm i -g pnpm@9

# Copy workspace configuration
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy all package.json files first (better caching)
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages ./packages

# Copy source code BEFORE install (needed for postinstall scripts)
COPY apps ./apps

# Install ALL dependencies (postinstall scripts will run)
RUN pnpm install --frozen-lockfile

# Build everything
RUN pnpm turbo run build --filter=./apps/*

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
COPY packages ./packages

# Copy built artifacts from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public

# Install only production dependencies (skip postinstall scripts)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

CMD ["pnpm", "run", "start:all"]