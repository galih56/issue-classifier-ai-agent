# ---------- Runtime ----------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g pnpm@9

# Copy only what we need
COPY package.json pnpm-lock.yaml ./ 
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/docs/package.json ./apps/docs/

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public 2>/dev/null || true

# Production install (workspace-aware)
RUN pnpm install --prod --ignore-scripts

EXPOSE 3000

CMD ["turbo", "run", "start:prod", "--parallel", "--filter=api", "--filter=web", "--filter=docs"]
