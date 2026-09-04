# Multi-stage build using Turborepo's `turbo prune --docker` pattern for apps/api
FROM node:22-alpine AS base
RUN corepack enable

# ---- Prune: compute the minimal subset of the monorepo apps/api needs ----
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @mc-tracker/api --docker

# ---- Install + build ----
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/tsconfig.base.json ./
RUN pnpm turbo run build --filter=@mc-tracker/api

# ---- Runtime image ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/apps/api ./apps/api

USER nestjs
WORKDIR /app/apps/api

EXPOSE 3001
CMD ["node", "dist/main.js"]
