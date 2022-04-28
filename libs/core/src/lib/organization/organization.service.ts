import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { CreateOrganizationDto } from './dto/createorganization.dto';
import { UpdateOrganizationDto } from './dto/updateorganization.dto';
import { Organization } from './entity/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async get(userId: string): Promise<Organization[] | any> {
    const res = await this.neo4jService
      .read(
        `
			  MATCH (p:Person { id: $userId })-[:WORKS_IN]->(o:Organization)
			  RETURN o
			  `,
        { userId },
      );
			return res.records.length ? res.records.map((row) => new Organization(row.get('o'))) : false;
  }

	async getOrganizationRoles(userId: string, organizationId: string): Promise<string[]> {
		const res = await this.neo4jService.read(
			`
					MATCH (p:Person { id: $userId })-[r:WORKS_IN { default: true }]->(o:Organization { id: $organizationId })
					RETURN r.role
				`,
			{ userId, organizationId },
		);
		return res.records.length ? res.records[0].get('r.role') : [];
	}

  async create(
    userId: string,
    properties: CreateOrganizationDto,
  ): Promise<Organization[] | any> {
    const res = await this.neo4jService.write(
      `
			MATCH (p:Person {id: $userId}), (a:Currency { code: $properties.defaultCurrency }), (c:Country { iso_2: $properties.defaultCountry }), (l:Language { alpha_2: $properties.defaultLanguage })
			WITH p, a, c, l, randomUUID() AS uuid
			CREATE (o:Organization { id: uuid, name: $properties.name})
			CREATE (p)-[:OWNS { createdAt: datetime(), deleted: false}]->(o)
			CREATE (p)-[:WORKS_IN { role: ['MANAGE_ORGANIZATION'], since: datetime() }]->(o)
			CREATE (o)-[:HAS_DEFAULT_COUNTRY]->(c)
			CREATE (o)-[:HAS_DEFAULT_CURRENCY]->(a)
			CREATE (o)-[:HAS_DEFAULT_LANGUAGE]->(l)
			CREATE (m:Channel { id: randomUUID(), name: 'default-channel' })
			CREATE (o)<-[:BELONGS_TO { createdBy: $userId, createdAt: datetime(), active: true, deleted: false }]-(m)
			CREATE (m)-[:HAS_DEFAULT_COUNTRY]->(c)
			CREATE (m)-[:HAS_DEFAULT_CURRENCY]->(a)
			WITH o, p
			MATCH (p)-[:HAS_METADATA]->(d:Metadata { key: 'DEFAULT_ORGANIZATION' })
			SET d.value = o.id
			RETURN o
	  `,
      {
        userId,
        properties,
      },
    );

		return res.records.length ? res.records.map((row) => new Organization(row.get('o'))) : false;

  }

  async update(
    properties: UpdateOrganizationDto,
  ): Promise<Organization[] | any> {
    const res = await this.neo4jService.write(
      `
		MATCH (p:Person)-[r:OWNS]->(o {id: $properties.organizationId})
		WITH o, p, r
		SET o.name = $properties.name
		SET r.updatedAt = datetime()
		RETURN o
	  `,
      {
        properties,
      },
    );

    return res.records.length ? res.records.map((row) => new Organization(row.get('o'))) : false;
  }

  async delete(userId: string, organizationId: string): Promise<any> {
    const res = await this.neo4jService.write(
      `
			MATCH (p:Person {id: $userId})-[r:OWNS]->(o:Organization {id: $organizationId})
			SET r.deleted = true
			RETURN o
			`,
      {
        userId, organizationId
      },
    );
		return res.records.length ? res.records.map((row) => new Organization(row.get('o'))) : false;
  }
}
