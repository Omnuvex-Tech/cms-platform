import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '50mb' }));

  const rawOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const corsOrigins = rawOrigins.length
    ? rawOrigins
    : ['https://pre.treva.realestate', 'https://admin.pre.treva.realestate', 'http://localhost:3000', 'http://localhost:10010', 'http://localhost:10021'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
  }));

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  app.useStaticAssets(join(process.cwd(), 'public'));

  await app.listen(Number(process.env.PORT));
}
bootstrap();