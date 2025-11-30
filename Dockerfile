# ---------- Build stage ----------
FROM node:22-alpine AS builder

# Install pnpm globally (version 9)
RUN npm i -g pnpm@9

WORKDIR /app

# Copy root manifest files
COPY package.json pnpm-lock.yaml ./

# Copy workspace manifests
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Copy TypeScript configs (if any)
COPY apps/api/tsconfig.json apps/api/
COPY apps/web/tsconfig.json apps/web/

# Copy source code for both apps
COPY apps/api/src ./apps/api/src
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public

# Install all workspace dependencies (including dev deps needed for build)
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Build the API (produces dist folder)
RUN pnpm --filter api run build

# Build the SolidStart web app (produces .output folder)
RUN pnpm --filter web run build

# ---------- Runtime stage ----------
FROM node:22-alpine AS runtime
RUN npm i -g pnpm@9
WORKDIR /app

# Copy the built artifacts and runtime files from the builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/web/package.json ./apps/web/

# Install only production dependencies (no dev deps needed at runtime)
RUN pnpm install --prod --frozen-lockfile

# Expose the port used by the SolidStart front‑end (default 3000)
EXPOSE 3000

# Start both the API and the web server concurrently.
# The API runs on its default port (e.g., 4000) and the web app on 3000.
# Using a simple sh command to launch both processes.
CMD ["sh", "-c", "pnpm --filter api run start & pnpm --filter web run start"]
