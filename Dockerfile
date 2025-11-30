# ---------- Build stage ----------
FROM node:22-alpine AS builder

RUN npm i -g pnpm@9 turbo

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# copy other packages if you have any in packages/, libs/, etc.

# Install + Turborepo cache priming
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# THIS is the correct way → use turbo, not pnpm --filter
RUN turbo run build --filter=./apps/*

# ---------- Runtime stage ----------
FROM node:22-alpine AS runtime
RUN npm i -g pnpm@9
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
# copy package.jsons again...
RUN pnpm install --prod --frozen-lockfile

CMD ["turbo", "run", "start:prod"]   # or your actual start task