import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/common/interceptors/http-response.interceptor';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { RequestQueryInterceptor } from 'src/common/interceptors/http-request.interceptor';
import { AppController } from 'src/app.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 1 * 60 * 1000, // 1 minute
        limit: 10,
      },
    ]),

    CacheModule.register({
      isGlobal: true,
      ttl: 3 * 60 * 1000, // 3 minutes
    }),

    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UserModule,
    ProductModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestQueryInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
