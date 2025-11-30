# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm + turbo
RUN npm i -g pnpm@9 turbo@2

# Copy workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml turbo.json package.json ./
COPY apps ./apps

# Install dependencies
RUN pnpm install

# Build
RUN turbo run build --filter=./apps/*

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

COPY packages ./packages

# Copy needed manifests
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/

# Copy built files from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public

# Production dependencies
RUN pnpm install --prod --ignore-scripts

EXPOSE 3000

CMD ["turbo", "run", "start:prod", "--parallel", "--filter=api", "--filter=web", "--filter=docs"]
