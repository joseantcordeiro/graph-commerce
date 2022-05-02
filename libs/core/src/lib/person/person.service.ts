import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { CreatePersonDto } from './dto/createperson.dto';
import { UpdatePersonDto } from './dto/updateperson.dto';
import { Person } from './entity/person.entity';
import { MinioClientService } from '../upload/minio-client.service';
import { BufferedFile } from '../upload/entity/image.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FindPersonDto } from '../organization/dto/findperson.dto';
import { Organization } from '../organization/entity/organization.entity';
import { toNativeTypes } from '@graph-commerce/common';

@Injectable()
export class PersonService {
  constructor(
		@InjectQueue('picture') private readonly pictureQueue: Queue,
    private readonly neo4jService: Neo4jService,
		private minioClientService: MinioClientService,
  ) {}
  /**
  async userTeams(userId: string): Promise<Response | undefined> {
    const res = await this.neo4jService.read(
      `
			MATCH (u:User {id: $userId})
			RETURN u,
						 [(u)-[:WORKS_AT]->(t:Team) | t.id] AS teams
        `,
      { userId },
    );
    if (res.records.length) {
      const team = res.records.map((row) => new Response(row.get('teams')));
      return team;
    } else {
      return undefined;
    }
  }
*/

  async get(userId: string): Promise<unknown> {
    const res = await this.neo4jService.read(
      `
      MATCH (p:Person { id: $userId })-[:HAS_METADATA]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
      MATCH (p)-[:HAS_DEFAULT_LANGUAGE]->(l:Language)
			MATCH (o:Organization { id: m.value })
      RETURN p {
        .*,
        defaultLanguage: l.alpha_2,
        defaultOrganizationId: o.id,
        defaultOrganizationName: o.name
      } AS person
			`,
      { userId },
    );

    return res.records.length ? toNativeTypes(res.records[0].get('person')) : false;
  }

  async find(properties: FindPersonDto): Promise<Person[] | boolean> {
    const res = await this.neo4jService.read(
      `
      MATCH (p:Person {email: $properties.email})-[:WORKS_IN]->(o:Organization {id: $properties.organizationId})
      RETURN p
        `,
      { properties },
    );

    return res.records.length ? res.records.map((row) => new Person(row.get('p'))) : false;
  }

	async getRoles(userId: string): Promise<string[]> {
		const res = await this.neo4jService.read(
			`
					MATCH (p:Person { id: $userId })-[:HAS_METADATA]->(m:Metadata { key: 'ROLES' })
					RETURN m.value AS roles
			`,
			{ userId },
		);
		return res.records.length ? res.records[0].get('roles') : [];
	}

	async organization(userId: string): Promise<Organization[] | any> {
		const res = await this.neo4jService.read(
			`
			MATCH (p:Person { id: $userId })-[:HAS_METADATA]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
			WITH m
			MATCH (o:Organization { id: m.value })
			RETURN o
			`,
		 { userId },
		);
		return res.records.length ? res.records.map((row) => new Organization(row.get('o'))) : false;

	}

	async makeDefaultOrganization(userId: string, organizationId: string): Promise<Organization[] | any> {
		const res = await this.neo4jService.write(
			`
			MATCH (p:Person { id: $userId })-[HAS_METADATA]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
			SET m.value = $organizationId
			WITH p, m
			MATCH (o:Organization { id: m.value })
			RETURN o
			`,
			{ userId, organizationId },
		);
		return res.records.length ? res.records.map((row) => new Organization(row.get('o'))) : false;
	}

	async create(properties: CreatePersonDto): Promise<Person[] | any> {
    const res = await this.neo4jService
      .write(
        `
						MATCH (l:Language { alpha_2: $properties.defaultLanguage })
						WITH l
            CREATE (p:Person { id: $properties.userId, name: $properties.name, email: $properties.email })
						CREATE (p)-[:HAS_DEFAULT_LANGUAGE]->(l)
						CREATE (m:Metadata { key: 'DEFAULT_ORGANIZATION', value: '' })
						CREATE (p)-[:HAS_METADATA { private: false }]->(m)
						CREATE (n:Metadata { key: 'ROLES', value: [] })
						CREATE (p)-[:HAS_METADATA { createdBy: $properties.userId, createdAt: datetime(), private: true }]->(n)
            RETURN p
        `,
        {
          properties,
        },
      );

		return res.records.length ? res.records.map((row) => new Person(row.get('p'))) : false;
  }

  async createStaff(properties: CreatePersonDto): Promise<Person | undefined> {
    return this.neo4jService
      .write(
        `
						MATCH (l:Language { alpha_2: $.properties.defaultLanguage })
						WITH l
            CREATE (p:Person { id: $properties.userId })
            SET p.name = $properties.name, p.email = $properties.email, p.createdAt: datetime()
						CREATE (p)-[:WORKS_IN { since: datetime() }]->(o:Organization { id: $properties.organizationId })
						CREATE (p)-[:HAS_DEFAULT_LANGUAGE]->(l)
            RETURN p
        `,
        {
          properties,
        },
      )
      .then((res) => new Person(res.records[0].get('p')));

  }

  async update(properties: UpdatePersonDto): Promise<Person[] | any> {
    const res = await this.neo4jService.write(
      `
            MATCH (p:Person { id: $properties.userId })-[r:WORKS_IN]->(o:Organization { id: $properties.organizationId })
						WITH p, r
            SET p.name = $properties.name, p.email = $properties.email
						SET r.updatedAt = datetime()
            RETURN p
        `,
      { properties },
    );
    // TODO: Emit Person Updated Event
    return res.records.length ? res.records.map((row) => new Person(row.get('p'))) : false;
  }

  async delete(userId: string): Promise<any> {
    // TODO: Emit Person Deleted Event
    return this.neo4jService.write(
      `
					MATCH (p:Person { id: $userId })
					DETACH DELETE p
				`,
      { userId },
    );
  }

	async uploadPicture(userId: string, image: BufferedFile): Promise<any> {
		const uploaded_image = await this.minioClientService.upload(image);
		const picture = uploaded_image.url;

		const res = await this.neo4jService.write(
			`
					MATCH (p:Person { id: $userId })
					SET p.picture = $picture
					RETURN p.picture AS profile_picture
				`,
			{ userId, picture },
		);

		await this.pictureQueue.add('resize', {
      file: res.records[0].get('profile_picture'),
    });

		return {
			message: "Profile picture updated successfully.",
			profile_picture: res.records[0].get('profile_picture')
		};
	}
}
