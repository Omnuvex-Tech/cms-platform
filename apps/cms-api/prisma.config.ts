import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

loadEnv({ path: envFile, override: true });

export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
    seed: 'node ../../scripts/run-with-env.cjs .env.development ts-node/dist/bin.js seed.ts',
  },
  datasource: {
    url: env('DB_URI'),
  },
});
