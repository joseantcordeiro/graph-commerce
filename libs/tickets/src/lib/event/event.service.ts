import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j";
import { Event } from "./entity/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";

@Injectable()
export class EventService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async create(properties: CreateEventDto): Promise<Event[] | unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (o:Organization { id: $properties.organizationId })
      WITH o, randomUUID() AS uuid
      CREATE (e:Event { id: uuid, name: $properties.name, description: $properties.description, type: $properties.type })
      CREATE (o)<-[:BELONGS_TO { createdBy: $properties.createdBy, createdAt: datetime(), active: $properties.active, deleted: false }]-(e)
      CREATE (e)<-[:LOCATED_AT { latitude: $properties.latitude, longitude: $properties.longitude }]-(o)
      CREATE (e)<-[:STARTED_AT { startDate: $properties.startDate, endDate: $properties.endDate, timeZone: $properties.timeZone }]-(o)
      CREATE (m:Metadata { key: 'EVENT_TYPE', value: $properties.type })
      CREATE (e)-[:HAS_METADATA]->(m)


      RETURN e
    `,
      { properties },
    );
    return res.records.length ? res.records.map((row) => new Event(row.get("e"))) : false;

  }

}
