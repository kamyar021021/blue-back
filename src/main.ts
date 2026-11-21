// back/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // فعال‌سازی CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002', // آدرس فرانت‌اند
    credentials: true, // برای ارسال کوکی‌ها یا هدرهای احراز هویت
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || 3001);
}
bootstrap();