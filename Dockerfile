FROM node:22-alpine AS base
RUN npm i -g pnpm@9 turbo@2
WORKDIR /app

FROM base AS pruner
COPY . .
RUN turbo prune --scope=@repo/api --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@repo/api

FROM base AS runtime
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]