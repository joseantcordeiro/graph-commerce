import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entity/channel.entity';

@Injectable()
export class ChannelService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async get(channelId: string): Promise<Channel[] | unknown> {
    const res = await this.neo4jService
      .read(
        `
				MATCH (c:Channel {id: $channelId})-[r:BELONGS_TO { deleted: false } ]->(o:Organization)
			  RETURN c
			  `,
        { channelId },
      );
			return res.records.length ? res.records.map((row) => new Channel(row.get('c'))) : false;
  }

	async list(userId: string): Promise<Channel[] | unknown> {
		const res = await this.neo4jService.read(
			`
			MATCH (p:Person {id: $userId})-[:WORKS_IN]->(o:Organization)
			WITH p, o
			MATCH (c:Channel)-[:BELONGS_TO { active: true, deleted: false }]->(o:Organization)
			RETURN c
			`,
			{ userId },
		);
		return res.records.length ? res.records.map((row) => new Channel(row.get('c'))) : false;
	}

  async create(userId: string,
    properties: CreateChannelDto,
  ): Promise<Channel[] | unknown> {
    const res = await this.neo4jService.write(
      `
			MATCH (o:Organization { id: $properties.organizationId }),(a:Currency { code: $properties.defaultCurrency }), (c:Country { iso_2: $properties.defaultCountry })
			WITH o, a, c, randomUUID() AS uuid
			CREATE (m:Channel { id: uuid, name: $properties.name })
			CREATE (o)<-[:BELONGS_TO { createdBy: $userId, createdAt: datetime(), active: $properties.active, deleted: false }]-(m)
			CREATE (m)-[:HAS_DEFAULT_COUNTRY]->(c)
			CREATE (m)-[:HAS_DEFAULT_CURRENCY]->(a)
			RETURN m
	  `,
      {
        userId, properties,
      },
    );

		return res.records.length ? res.records.map((row) => new Channel(row.get('m'))) : false;

  }

  async update(
    properties: UpdateChannelDto,
  ): Promise<Channel[] | unknown> {
    const res = await this.neo4jService.write(
      `
		MATCH (c:Channel {id: $properties.channelId})-[r:BELONGS_TO]->(o:Organization)
		WITH c, r
		SET c.name = $properties.name
		SET r.updatedAt = datetime(), r.active = $properties.active
		RETURN c
	  `,
      {
        properties,
      },
    );
    return res.records.length ? res.records.map((row) => new Channel(row.get('c'))) : false;
  }

  async delete(userId, properties): Promise<Channel[] | unknown> {
    const res = await this.neo4jService.write(
      `
			MATCH (c:Channel {id: $properties.channelId})-[r:BELONGS_TO]->(o:Organization)
			SET r.deletedBy = $userId, r.deleted = true, r.channelTargetId = $properties.targetChannelId
			RETURN c
			`,
      {
        userId, properties,
      },
    );
		return res.records.length ? res.records.map((row) => new Channel(row.get('c'))) : false;
  }
}
