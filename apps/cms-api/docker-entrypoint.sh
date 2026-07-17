#!/bin/sh
# Applies pending Prisma migrations against DB_URI, then starts the server.
# Safe to run on every deploy: `migrate deploy` only applies migrations not
# yet recorded in _prisma_migrations, it's a no-op when the DB is current.
set -e

echo "[entrypoint] Applying database migrations..."
npx prisma migrate deploy --schema=schema.prisma

echo "[entrypoint] Starting cms-api on :${PORT:-4000} ..."
exec node dist/src/main.js
