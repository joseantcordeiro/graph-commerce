import { Injectable } from '@nestjs/common';
import { Currency } from './entity/currency.entity';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class CurrenciesService {
  constructor(private readonly neo4jService: Neo4jService) {}

  list(): Promise<Currency[]> {
    return this.neo4jService
      .read(`MATCH (c:Currency { active: true }) RETURN c`)
      .then((res) => res.records.map((row) => new Currency(row.get('c'))));
  }
}
