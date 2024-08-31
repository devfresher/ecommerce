import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import 'reflect-metadata';
import { FormatRequestQueryInterceptor } from './common/interceptors/format-request.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.setGlobalPrefix('/api/v1');
  app.use(helmet());
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb' });
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * Formats validation errors into a single array of strings
       * @param validationErrors List of validation errors
       * @returns A new BadRequestException with the formatted error messages
       */
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errorMessages = validationErrors.flatMap((error) =>
          Object.values(error.constraints || {}).map(
            (message) => message.charAt(0).toUpperCase() + message.slice(1),
          ),
        );

        return new BadRequestException(errorMessages);
      },
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new FormatRequestQueryInterceptor());
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
