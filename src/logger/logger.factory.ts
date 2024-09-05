import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from 'src/logger/winston-logger.config';

export const LoggerFactory = (appName: string) => {
  const DEBUG = process.env.DEBUG;

  return WinstonModule.createLogger({
    level: DEBUG ? 'debug' : 'info',
    ...winstonLoggerConfig,
  });
};
