import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { Metadata } from './entity/metadata.entity';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { DeleteMetadataDto } from './dto/delete-metadata.dto';
import { GetMetadataDto } from './dto/get-metadata.dto';

@Injectable()
export class MetadataService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async createMetadata(userId: string, properties: CreateMetadataDto): Promise<Metadata[] | unknown> {
		const res = await this.neo4jService.write(
			`MATCH (n) WHERE (n.id = $properties.objectId)
			 WITH n
			 CREATE (m:Metadata { key: $properties.key, value: $properties.value })
			 CREATE (n)-[:HAS_METADATA { addedBy: $userId, createdAt: datetime(), private: $properties.private }]->(m)
			 RETURN m
			`,
			{	userId, properties },
		);
		return res.records.length ? res.records.map((row) => new Metadata(row.get('m'))) : false;

  }

	async deleteMetadata(properties: DeleteMetadataDto): Promise<unknown> {
		await this.neo4jService.write(
			`MATCH (n { id: $properties.objectId })-[r:HAS_METADATA]->(m:Metadata { key: $properties.key})
			 DETACH DELETE m
			`,
			{	properties },
		);
		return {};
	}

	async updateMetadata(properties: UpdateMetadataDto): Promise<Metadata[] | unknown> {
		const res = await this.neo4jService.write(
				`MATCH (n { id: $properties.objectId })-[r:HAS_METADATA]->(m:Metadata { key: $properties.key})
				 SET m.value = $properties.value
				 SET r.updatedAt = datetime(), r.private = $properties.private
				 RETURN m
				`,
				{	properties },
		);
		return res.records.length ? res.records.map((row) => new Metadata(row.get('m'))) : false;
	}

	async getMetadata(properties: GetMetadataDto): Promise<Metadata[] | unknown> {
		const res = await this.neo4jService.read(
				`MATCH (n { id: $properties.objectId })-[r:HAS_METADATA]->(m:Metadata { key: $properties.key })
				 RETURN m
				`,
				{	properties },
		);
		return res.records.length ? res.records.map((row) => new Metadata(row.get('m'))) : false;
	}

	async getPublicMetadata(objectId: string): Promise<Metadata[] | unknown> {
		const res = await this.neo4jService.read(
				`MATCH (n { id: $objectId })-[:HAS_METADATA  { private: false }]->(m:Metadata)
				 RETURN m
				`,
				{	objectId },
		);
		return res.records.length ? res.records.map((row) => new Metadata(row.get('m'))) : false;
	}

	async getPrivateMetadata(objectId: string): Promise<Metadata[] | unknown> {
		const res = await this.neo4jService.read(
				`MATCH (n { id: $objectId })-[:HAS_METADATA { private: true }]->(m:Metadata)
				 RETURN m
				`,
				{	objectId },
		);
		return res.records.length ? res.records.map((row) => new Metadata(row.get('m'))) : false;
	}

}
