import { existsSync } from 'node:fs';
import { join } from 'node:path';

const envPaths = [
  join(process.cwd(), '.env'),
  join(process.cwd(), 'apps', 'cms-api', '.env'),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    process.loadEnvFile?.(envPath);
    break;
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://admin.trenders.team'
  ],
  credentials: true,
});

  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(join(process.cwd(), 'public'));

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
