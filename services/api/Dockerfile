# TelyAd API container (Fastify + Prisma/PostgreSQL).
# Build context is the repo ROOT (monorepo): docker build -f services/api/Dockerfile .
#
# NOTE: not built locally in this environment (no Docker available) — it is a
# conventional, ready-to-build image. Verify on first deploy.

# ── build ────────────────────────────────────────────────────────────────────
FROM node:20-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# Generate the Prisma client from the PostgreSQL schema, then bundle the API.
RUN pnpm --filter @telyad/api db:generate:pg
RUN pnpm --filter @telyad/api build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
ENV NODE_ENV=production STORE=prisma APP_ENV=production
WORKDIR /repo
COPY --from=build /repo /repo
WORKDIR /repo/services/api
EXPOSE 4000
# Apply committed migrations, then start. Seeding/reset is an explicit separate
# step (pnpm demo:reset) so a redeploy never wipes user-created demo state.
CMD ["sh", "-lc", "pnpm db:migrate:deploy && node dist/server.js"]
