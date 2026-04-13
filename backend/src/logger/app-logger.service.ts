import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly context?: string) {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'dua-backend', context: this.context },
      transports: [
        new winston.transports.Console({
          format:
            process.env.NODE_ENV !== 'production'
              ? winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple(),
                )
              : winston.format.json(),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  /**
   * Structured event log — used for audit trail and observability.
   */
  logEvent(event: {
    type: string;
    userId?: string;
    sessionId?: string;
    jobId?: string;
    status: 'success' | 'failure';
    message?: string;
    error?: string;
    metadata?: Record<string, unknown>;
  }) {
    this.logger.info(event.type, {
      ...event,
      timestamp: new Date().toISOString(),
    });
  }
}
