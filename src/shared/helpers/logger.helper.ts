/* eslint-disable @typescript-eslint/no-explicit-any */
import 'colors';

import { env } from 'process';
import winston, { Logger as Winston } from 'winston';

import config from '../../config';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

export class Logger {
  private logger: Winston;
  constructor(name: string) {
    this.logger = winston.createLogger({
      level: config.application.get('env') === 'development' ? 'debug' : 'info',
      format: winston.format.combine(
        enumerateErrorFormat(),
        config.application.get('env') === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf((info) => `${info.level}: ${info.message}`)
      ),
      defaultMeta: { service: name },
      transports: [
        new winston.transports.File({
          filename: './logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.metadata(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: './logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.metadata(),
            winston.format.json()
          ),
        }),
      ],
    });

    if (env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          stderrLevels: ['error', 'debug'],
        })
      );
    }
  }
  debug(log: string, metadata?: any) {
    this.logger.debug(log, metadata);
  }

  info(log: string, metadata?: any) {
    this.logger.info(log, metadata);
  }

  error(log: string, metadata?: any) {
    this.logger.error(log, metadata);
  }

  warn(log: string, metadata?: any) {
    this.logger.warn(log, metadata);
  }

  log(level: 'info' | 'error' | 'warn' | 'debug', log: string, metadata?: any) {
    const metadataObject: any = {};

    if (metadata) metadataObject.metadata = metadata;
    this.logger[level](log, metadata);
  }
}

export const logger = new Logger('root');

export default logger;
