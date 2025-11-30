# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm + turbo the Alpine-safe way
RUN npm i -g pnpm@9 turbo@2

# Create pnpm home so global bins work (this one line fixes the ERR_PNPM_NO_GLOBAL_BIN_DIR)
RUN pnpm setup

# IMPORTANT: add the global bin dir to PATH for this stage
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Copy manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml turbo.json package.json ./
COPY apps/*/package.json ./apps/*/

# Install dependencies (no frozen-lockfile here because Railway already ran it)
RUN pnpm install

# Install next globally (now works thanks to PNPM_HOME)
RUN pnpm add -g next

# Copy source and build
COPY . .
RUN turbo run build --filter=./apps/*

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Also set up pnpm home in runtime (optional but clean)
RUN pnpm setup
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Copy only what we need
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/
# Remove this line if auth-server doesn't exist or isn't used
# COPY apps/auth-server/package.json ./apps/auth-server/

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public 2>/dev/null || true

# Production install
RUN pnpm install --prod

EXPOSE 3000

# Start only the apps you actually want
CMD ["turbo", "run", "start:prod", "--parallel", "--filter=api", "--filter=web", "--filter=docs"]