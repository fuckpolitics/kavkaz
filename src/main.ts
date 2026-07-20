import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const isDev = (process.env.NODE_ENV ?? 'development') !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Same-origin / curl / mobile webviews without Origin
      if (!origin) {
        callback(null, true);
        return;
      }
      if (configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // Dev: allow LAN access like http://192.168.x.x:3001
      if (
        isDev &&
        /^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?$/.test(
          origin,
        )
      ) {
        callback(null, true);
        return;
      }
      // Prod convenience: allow same host over http(s) with common ports
      // when CORS_ORIGIN contains the host without requiring exact port match.
      const originHost = (() => {
        try {
          return new URL(origin).hostname;
        } catch {
          return '';
        }
      })();
      if (
        originHost &&
        configuredOrigins.some((o) => {
          try {
            return new URL(o).hostname === originHost;
          } catch {
            return o.includes(originHost);
          }
        })
      ) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
