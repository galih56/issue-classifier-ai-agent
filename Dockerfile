# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm i -g pnpm@9 turbo@2

COPY pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY package.json ./
COPY apps/**/package.json ./apps/*/

RUN pnpm install

# Fix for Next.js on Alpine (choose one)
RUN pnpm add -g next                  # ← Option A: global
# Or rely on "pnpm exec next build" in apps/docs/package.json (Option B)

COPY . .
RUN turbo run build --filter=./apps/*

# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app
RUN npm i -g pnpm@9

COPY --from=builder /app/apps/api/dist ./apps/api/dist
# COPY --from=builder /app/apps/auth-server/dist ./apps/auth-server/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public

COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
# COPY apps/auth-server/package.json ./apps/auth-server/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["turbo", "run", "start:prod", "--parallel"]