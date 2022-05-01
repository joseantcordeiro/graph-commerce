import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { Metadata } from '../metadata/entity/metadata.entity';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Injectable()
export class ConfigurationService {
  constructor(private readonly neo4jService: Neo4jService) {}

	async updateMetadata(properties: UpdateConfigurationDto): Promise<unknown> {
		const res = await this.neo4jService.write(
				`MATCH (n { id: $properties.objectId })-[r:HAS_METADATA { private: true, config: true }]->(m:Metadata { key: $properties.key})
				 SET m.value = $properties.value
				 SET r.updatedAt = datetime()
				 RETURN m {
          .*,
          objectId: $properties.objectId
        } AS metadata
				`,
				{	properties },
		);
		return res.records.length ? res.records[0].get('metadata') : false;
	}

	async getConfiguration(objectId: string, key: string): Promise<unknown> {
		const res = await this.neo4jService.read(
				`MATCH (n { id: $objectId })-[r:HAS_METADATA { private: true, config: true }]->(m:Metadata { key: $key })
				 RETURN m {
           .*,
           objectId: n.id
         } AS metadata
				`,
				{	objectId, key },
		);
		return res.records.length ? res.records[0].get('metadata') : false;
	}

  async getConfigurationByObjectId(objectId: string): Promise<Metadata[] | unknown> {
		const res = await this.neo4jService.read(
				`MATCH (n { id: $objectId })-[:HAS_METADATA { private: true, config: true }]->(m:Metadata)
				 RETURN m
				`,
				{	objectId },
		);
		return res.records.length ? res.records.map((row) => new Metadata(row.get('m'))) : false;
	}

}
