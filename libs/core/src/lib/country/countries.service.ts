import { Injectable } from '@nestjs/common';
import { Country } from './entity/country.entity';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class CountriesService {
  constructor(private readonly neo4jService: Neo4jService) {}

  list(): Promise<Country[]> {
    return this.neo4jService
      .read(`MATCH (c:Country { active: true }) RETURN c`)
      .then((res) => res.records.map((row) => new Country(row.get('c'))));
  }
}
