# cms-web — production image.
#
# Turborepo workspace: build context is the REPO ROOT, not this directory:
#   docker build -f apps/cms-web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t cms-web .
#
# NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WIDGET_URL are build ARGs, not runtime env vars: Next.js inlines
# NEXT_PUBLIC_* values into the client bundle at `next build` time, so they must
# be known when this image is built, and changing them means rebuilding the image.
#
# Uses `output: "standalone"` (next.config.js) — in a monorepo, Next traces
# the workspace root's node_modules, so the standalone output nests as
# .next/standalone/apps/cms-web/server.js, not .../server.js directly.
# Verified locally: the runner stage's COPY paths below match that exactly.

FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# 1. Prune the monorepo down to cms-web's slice (incl. @repo/shared, @repo/types, @repo/ui).
# ---------------------------------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune cms-web --docker

# ---------------------------------------------------------------------------
# 2. Install deps from the pruned lockfile, then build.
# ---------------------------------------------------------------------------
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WIDGET_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WIDGET_URL=$NEXT_PUBLIC_WIDGET_URL

RUN npx turbo run build --filter=cms-web

# ---------------------------------------------------------------------------
# 3. Minimal runtime image. Standalone output only bundles server.js + the
#    node_modules subset it actually needs — static assets and public/ are
#    copied in separately (Next does not include them in standalone output).
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=installer /app/apps/cms-web/.next/standalone ./
COPY --from=installer /app/apps/cms-web/.next/static ./apps/cms-web/.next/static
COPY --from=installer /app/apps/cms-web/public ./apps/cms-web/public

WORKDIR /app/apps/cms-web
USER nextjs
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
EXPOSE 3001

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WIDGET_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WIDGET_URL=$NEXT_PUBLIC_WIDGET_URL

CMD ["node", "server.js"]