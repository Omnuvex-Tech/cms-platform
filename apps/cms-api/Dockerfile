# cms-api — production image.
#
# This is a Turborepo workspace, so the build context is the REPO ROOT, not
# this directory:
#   docker build -f apps/cms-api/Dockerfile -t cms-api .
# `turbo prune` (stage 1) trims the monorepo down to just what cms-api needs
# (its own source + the exact deps it pulls in), so later layers stay small
# and cache cleanly — the npm-install layer only invalidates when a
# package.json/lockfile touched by cms-api actually changes.
#
# Debian slim (not alpine): bcrypt's native binding has reliable prebuilt
# binaries for glibc; musl (alpine) forces a from-source compile and is a
# common source of broken deploys for this exact package.

FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# 1. Prune the monorepo down to cms-api's slice.
# ---------------------------------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune cms-api --docker

# ---------------------------------------------------------------------------
# 2. Install deps from the pruned lockfile, then build.
# ---------------------------------------------------------------------------
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
RUN npx prisma generate --schema=apps/cms-api/schema.prisma
RUN npx turbo run build --filter=cms-api

# ---------------------------------------------------------------------------
# 3. Minimal runtime image.
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 nestjs && useradd --system --uid 1001 --gid nestjs nestjs

COPY --from=installer /app .
RUN sed -i 's/\r$//' apps/cms-api/docker-entrypoint.sh \
 && chmod +x apps/cms-api/docker-entrypoint.sh

WORKDIR /app/apps/cms-api
USER nestjs
ENV NODE_ENV=production
EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
