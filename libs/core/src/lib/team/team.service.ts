import { toNativeTypes } from '@graph-commerce/common';
import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j/dist';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
/** import { AddUserTeamDto } from './dto/addUser-team.dto';
import { RemoveUserTeamDto } from './dto/removeUser-team.dto'; */
import { Team } from './entity/team.entity';
// import { Node, Integer } from 'neo4j-driver';

@Injectable()
export class TeamService {
  constructor(private readonly neo4jService: Neo4jService) {}

	async get(userId: string): Promise<Team[] | unknown> {
		const res = await this.neo4jService.read(
			`
      MATCH (p:Person { id: $userId })-[:HAS_METADATA]->(m:Metadata { key: 'DEFAULT_ORGANIZATION' })
      MATCH (t:Team)-[:BELONGS_TO { deleted: false }]->(o:Organization { id: m.value })
			RETURN t
			`, { userId },
		);
		return res.records.length ? res.records.map((row) => new Team(row.get('t'))) : false;
	}

  async getById(teamId: string): Promise<unknown> {
    const res = await this.neo4jService.read(
      `
				MATCH (t:Team {id: $teamId})-[r:BELONGS_TO]->(o:Organization)
        RETURN t {
          .*,
          active: r.active
        } AS team
        `,
      { teamId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false;
  }

  async create(
    userId: string,
    properties: CreateTeamDto,
  ): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
			MATCH (o:Organization { id: $properties.organizationId })
			WITH o, randomUUID() AS uuid
      CREATE (t:Team { id: uuid, name: $properties.name, description: $properties.description })
      CREATE (m:Metadata { key: 'ROLES', value: $properties.roles })
      CREATE (t)-[:HAS_METADATA { createdBy: $userId, createdAt: datetime(), private: true }]->(m)
			CREATE (t)-[r:BELONGS_TO { createdBy: $userId, createdAt: datetime(), active: true, deleted: false}]->(o)
      RETURN t {
        .*,
        active: r.active,
        deleted: r.deleted,
        createdBy: r.createdBy,
        createdAt: r.createdAt
      } AS team
      `,
      {
        userId,
        properties,
      },
    );

    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false;
  }

  async enable(teamId: string): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (t:Team { id: $teamId })-[r:BELONGS_TO]->(o:Organization)
      SET r.active = true
      RETURN t {
        .*,
        active: r.active
      } AS team
      `,
      { teamId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

  async disable(teamId: string): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (t:Team { id: $teamId })-[r:BELONGS_TO]->(o:Organization)
      SET r.active = false
      RETURN t {
        .*,
        active: r.active
      } AS team
      `,
      { teamId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

  async update(
    properties: UpdateTeamDto,
  ): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (t:Team { id: $properties.teamId })-[r:BELONGS_TO]->(o:Organization)
      SET t.name = $properties.name, t.description = $properties.description
      SET r.updatedAt = datetime()
      RETURN t {
        .*,
        active: r.active
      } AS team
      `,
      { properties },
    );
		return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

  async patchPermissions(
    properties: UpdateTeamDto,
  ): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (t:Team { id: $properties.teamId })-[r:HAS_METADATA]->(m:Metadata { key: 'ROLES' })
      SET r.roles = $properties.roles
      SET r.updatedAt = datetime()
      RETURN t {
        .*,
        active: r.active
      } AS team
      `,
      { properties },
    );
		return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

  async getPermissions(
    teamId: string,
  ): Promise<string[] | unknown> {
    const res = await this.neo4jService.read(
      `
      MATCH (t:Team { id: $teamId })-[:HAS_METADATA]->(m:Metadata { key: 'ROLES' })
      RETURN m.roles AS roles
      `,
      { teamId },
    );
		return res.records.length ? res.records[0].get('roles') : false
  }

  async delete(teamId: string): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (t:Team { id: $teamId })-[r:BELONGS_TO]->(o:Organization)
      SET r.deleted = true
      RETURN t {
        .*,
        active: r.active
        deleted: r.deleted
      } AS team
      `,
      { teamId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

  async addMember(teamId: string, userId: string): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (t:Team { id: $teamId }), (u:Person { id: $userId })
      CREATE (u)-[:IS_MEMBER { since: datetime() }]->(t)
      RETURN t {
        .*,
        member: u {
          .*
        }
      } AS team
      `,
      { teamId, userId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

  async removeMember(teamId: string, userId: string): Promise<unknown> {
    const res = await this.neo4jService.write(
      `
      MATCH (u:Person { id: $userId })-[r:IS_MEMBER]->(t:Team { id: $teamId })
      DELETE r
      RETURN t {
        .*,
        member: u {
          .*
        }
      } AS team
      `,
      { teamId, userId },
    );
    return res.records.length ? toNativeTypes(res.records[0].get('team')) : false
  }

}
