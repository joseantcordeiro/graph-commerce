import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly neo4jService: Neo4jService) {
    super();
  }

  check(): Promise<number> {
    return this.neo4jService
      .read(
        `
			MATCH (n)
			RETURN count(n) AS count
		`,
      )
      .then((res) => res.records[0].get('count'));
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const nodes = await this.check();
    const isHealthy = nodes > 0;
    const result = this.getStatus(key, isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Database is not healthy', result);
  }
}
