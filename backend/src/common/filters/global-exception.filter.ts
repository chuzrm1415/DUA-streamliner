import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@/logger/app-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : (body as any).message ?? exception.message;
      details = typeof body === 'object' ? (body as any).details : undefined;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Never log 4xx as errors — only 5xx
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status}: ${message}`,
        'GlobalExceptionFilter',
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
