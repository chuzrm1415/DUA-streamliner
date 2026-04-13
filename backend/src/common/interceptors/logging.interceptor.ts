import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AppLogger } from '@/logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const userId = (req as any).user?.id ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `[${method}] ${url} → 2xx  (${ms}ms) user=${userId}`,
            'HTTP',
          );
        },
        error: () => {
          // Errors are handled by the global filter
        },
      }),
    );
  }
}
