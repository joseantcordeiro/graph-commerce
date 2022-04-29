import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicator/db.indicator';

@Module({
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
  exports: [],
})
export class HealthModule {}
