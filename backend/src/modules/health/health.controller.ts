import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '@/database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_PROCESSING_QUEUE } from '@/workers/document-processing/queue.constants';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DOCUMENT_PROCESSING_QUEUE) private readonly queue: Queue,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Overall health check' })
  async check() {
    const [db, redis] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkQueue(),
    ]);

    const healthy =
      db.status === 'fulfilled' && redis.status === 'fulfilled';

    return {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: db.status === 'fulfilled' ? 'ok' : 'error',
        redis: redis.status === 'fulfilled' ? 'ok' : 'error',
      },
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe — process is alive' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe — ready to serve traffic' })
  async readiness() {
    await this.checkDatabase();
    return { status: 'ready', timestamp: new Date().toISOString() };
  }

  private async checkDatabase() {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkQueue() {
    await this.queue.getWorkers();
  }
}
