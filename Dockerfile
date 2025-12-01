# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm (turbo will be installed locally from package.json)
RUN npm i -g pnpm@9

# Copy only what's needed for caching dependencies properly
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy source code (apps + packages)
COPY apps ./apps
COPY packages ./packages

# Install ALL dependencies (including devDeps because turbo needs them for build)
RUN pnpm install --frozen-lockfile

# Build everything
RUN pnpm turbo run build --filter=./apps/*

# ---------- Pruner (optional but recommended) ----------
FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm i -g pnpm@9 turbo@2
COPY --from=builder /app .
RUN turbo prune --scope=api --scope=web --scope=docs --docker

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Install only pnpm (no global turbo needed)
RUN npm i -g pnpm@9

# Copy pruned workspace (much smaller + safer)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/ .

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public

# Install only production dependencies (super small final image)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Expose ports (Railway will detect them automatically)
EXPOSE 3000

# Start all three apps in parallel without relying on global turbo
CMD ["pnpm", "run", "start:all"]