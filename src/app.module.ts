import {
  BeforeApplicationShutdown,
  Inject,
  LoggerService,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
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
import { Connection } from 'mongoose';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { winstonLoggerConfig } from './logger/winston-logger.config';
import * as Joi from 'joi';

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
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development')
          .required(),
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRES: Joi.string().default('5h').required(),
        DB_URI: Joi.string().required(),
        SEED_USER_AND_PRODUCTS: Joi.boolean().default('true').required(),
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
      inject: [ConfigService],
    }),

    WinstonModule.forRoot(winstonLoggerConfig),

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
export class AppModule implements BeforeApplicationShutdown, OnApplicationShutdown {
  constructor(
    @InjectConnection() private readonly dbConnection: Connection,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService, // Inject Winston Logger
  ) {}

  async beforeApplicationShutdown(signal?: string) {
    this.logger.log(`Received shutdown signal: ${signal}`, 'AppModule');

    if (this.dbConnection) await this.dbConnection.close();

    this.logger.log(`Mongoose connection closed`, 'AppModule');
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown gracefully`, 'AppModule');
  }
}
