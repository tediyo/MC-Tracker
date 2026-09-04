# Multi-stage build using Turborepo's `turbo prune --docker` pattern for apps/web
#
# Build from the REPO ROOT:
#   docker build -f apps/web/Dockerfile -t mc-tracker-web .

FROM node:22-alpine AS base
RUN corepack enable

# ---- Stage 1: Prune monorepo ----
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @mc-tracker/web --docker

# ---- Stage 2: Install + build ----
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN pnpm turbo run build --filter=@mc-tracker/web

# ---- Stage 3: Runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nextjs:nodejs /app/apps/web ./apps/web

USER nextjs
WORKDIR /app/apps/web

EXPOSE 3000
CMD ["pnpm", "start"]
