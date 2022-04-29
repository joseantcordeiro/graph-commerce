import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Get, Controller } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicator/db.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private databaseHealthIndicator: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.databaseHealthIndicator.isHealthy('db'),
    ]);
  }
}
