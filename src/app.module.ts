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
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawUrl = config.get<string>('DATABASE_URL');

        // 🔍 لاگ تشخیصی — بعد از رفع مشکل حذف کن
        console.log('🔍 DATABASE_URL detected:', rawUrl ? 'YES' : 'NO');
        console.log('🔍 DB_HOST env:', config.get('DB_HOST'));

        if (!rawUrl) {
          throw new Error('❌ DATABASE_URL is not set on Render Environment!');
        }

        let parsed: URL;
        try {
          parsed = new URL(rawUrl);
        } catch {
          throw new Error(`❌ DATABASE_URL is malformed: ${rawUrl}`);
        }

        console.log('🔍 Connecting to DB host:', parsed.hostname);

        // 🔒 اگه هاست base بود، صریحاً جلوش رو بگیر
        if (parsed.hostname === 'base') {
          throw new Error('❌ DATABASE_URL points to host "base" — fix it on Render!');
        }

        return {
          type: 'postgres' as const,
          url: rawUrl.split('?')[0],
          ssl: { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
        };
      },
    }),

    UserModule,
    AuthModule,
  ],
})
export class AppModule {}