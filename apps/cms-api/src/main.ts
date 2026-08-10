import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

function resolveCorsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured?.length) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CORS_ORIGINS must be set in production (comma-separated list of allowed origins).',
    );
  }

  return DEV_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
    // The panel names downloaded files from the server's Content-Disposition
    // (conversation exports, leads CSV); without this the browser hides the
    // header from cross-origin fetch and every download falls back to a guess.
    exposedHeaders: ['Content-Disposition'],
  });

  // whitelist strips any request-body property not declared on the target DTO
  // (e.g. a client echoing back `id` on a PATCH) instead of passing it through
  // to Prisma, which rejects unknown fields.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useStaticAssets(join(process.cwd(), 'public'));

  // So OnModuleDestroy actually runs on SIGTERM — the Telegram long poll needs
  // to be aborted on shutdown rather than left hanging on an open request.
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();