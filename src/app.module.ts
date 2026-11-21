import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // روی Render فایل .env وجود نداره؛ مشکلی نیست، از env خود Render میخونه
      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawUrl = config.getOrThrow<string>('DATABASE_URL');

        // Neon: پارامترهای sslmode و channel_binding رو حذف میکنیم
        // و SSL رو خودمون صریح ست میکنیم تا pg هیچوقت گیر نده
        const url = rawUrl.split('?')[0];

        return {
          type: 'postgres' as const,
          url,
          ssl: { rejectUnauthorized: false }, // Neon فقط با SSL وصل میشه
          autoLoadEntities: true,
          synchronize: true, // فقط برای اولین دیپلوی تا جدولها ساخته بشن
          logging: false,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),

    UserModule,
    AuthModule,
  ],
})
export class AppModule {}