import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { CreateGroupDto } from './dto/creategroup.dto';
import { UpdateGroupDto } from './dto/updategroup.dto';
import { Group } from './entity/group.entity';

@Injectable()
export class GroupService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async get(groupId: string): Promise<Group[] | unknown> {
    const res = await this.neo4jService
      .read(
        `
				MATCH (g:Group {id: $groupId})-[r:BELONGS_TO { active: true, deleted: false } ]->(o:Organization)
			  RETURN g
			  `,
        { groupId },
      );
			return res.records.length ? res.records.map((row) => new Group(row.get('g'))) : false;
  }

	async list(userId: string): Promise<Group[] | unknown> {
		const res = await this.neo4jService.read(
			`
			MATCH (p:Person {id: $userId})-[:WORKS_IN]->(o:Organization)
			WITH p, o
			MATCH (g:Group)-[:BELONGS_TO { active: true, deleted: false }]->(o:Organization)
			RETURN g
			`,
			{ userId },
		);
		return res.records.length ? res.records.map((row) => new Group(row.get('g'))) : false;
	}

  async create(userId: string,
    properties: CreateGroupDto,
  ): Promise<Group[] | unknown> {
    const res = await this.neo4jService.write(
      `
			MATCH (o:Organization { id: $properties.organizationId })
			WITH o, randomUUID() AS uuid
			CREATE (g:Group { id: uuid, name: $properties.name, description: $properties.description, type: $properties.type })
			CREATE (o)<-[:BELONGS_TO { createdBy: $userId, createdAt: datetime(), active: $properties.active, deleted: false }]-(g)
			RETURN g
	  `,
      {
        userId, properties,
      },
    );

		return res.records.length ? res.records.map((row) => new Group(row.get('g'))) : false;

  }

  async update(
    properties: UpdateGroupDto,
  ): Promise<Group[] | unknown> {
    const res = await this.neo4jService.write(
      `
		MATCH (g:Group {id: $properties.groupId})-[r:BELONGS_TO]->(o:Organization)
		WITH g, r
		SET g.name = $properties.name, g.description = $properties.description
		SET r.updatedAt = datetime(), r.active = $properties.active
		RETURN g
	  `,
      {
        properties,
      },
    );
    return res.records.length ? res.records.map((row) => new Group(row.get('g'))) : false;
  }

  async delete(userId: string, groupId: string): Promise<Group[] | unknown> {
    const res = await this.neo4jService.write(
      `
			MATCH (g:Group {id: $groupId})-[r:BELONGS_TO]->(o:Organization)
			SET r.deletedBy = $userId, r.deleted = true
			RETURN g
			`,
      {
        userId, groupId,
      },
    );
		return res.records.length ? res.records.map((row) => new Group(row.get('g'))) : false;
  }

	async join(userId: string, memberId: string, groupId: string): Promise<Group[] | unknown> {
		const res = await this.neo4jService.write(
			`
			MATCH (p:Person {id: $memberId}), (g:Group {id: $groupId})
			CREATE (p)-[:MEMBER_IN { addedBy: $userId, createdAt: datetime(), active: true, deleted: false }]->(g)
			RETURN g
			`,
			{
				userId, memberId, groupId,
			},
		);
		return res.records.length ? res.records.map((row) => new Group(row.get('g'))) : false;
	}
}
