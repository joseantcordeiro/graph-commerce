import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Document } from 'meilisearch';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Channel } from '@graph-commerce/core';
import { SearchService } from '@graph-commerce/search';
import { OrganizationDefaultConfig } from '../config/organization-default-config';
import { toNativeTypes } from '@graph-commerce/common';

@Processor('organization')
export class OrganizationProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
		private readonly searchService: SearchService,
		private readonly neo4jService: Neo4jService) {}

		async getDefaultChannel(objectId: string): Promise<unknown> {
			const res = await this.neo4jService.read(
				`
				MATCH (c:Channel)-[r:BELONGS_TO]->(o:Organization { id: $objectId })
				RETURN c {
          .*,
          active: r.active,
          deleted: r.deleted,
          createdAt: r.createdAt
        } AS channel
				`,
				{ objectId },
			);
			return res.records.length ? toNativeTypes(res.records[0].get('channel')) : 'ERROR';

		}

    async addConfigMetadata(objectId: string) {
      OrganizationDefaultConfig.forEach (async function(value, key) {
        await this.neo4jService.write(
          `
          MATCH (o:Organization { id: $objectId })
          CREATE (m:Metadata { key: $key, value: $value })
          CREATE (o)-[:HAS_METADATA { createdAt: datetime(), private: true, config: true }]->(m)
          RETURN m
          `,
          { objectId, key, value },
        );
        this.logger.info('[OrganizationProcessor] Metadata ' + key + ' added to ' + objectId);
      }.bind(this));
    }

	@Process('update')
  async update(job: Job) {
    const doc: Document = [];
		doc.push(job.data.organization);
		const index = "organization";
		return this.searchService.updateDocuments(index, [doc[0]]);
  }

	@Process('create')
  async create(job: Job) {
    const doc: Document = [];
		doc.push(job.data.organization);
		this.searchService.addDocuments("organization", [doc[0]])
		const organizationId = doc[0].id;
    /** this.addConfigMetadata(objectId);
		const createIndex: CreateIndexDto = {
			uid: "group-" + objectId,
			primaryKey: "id",
		};
		this.searchService.addIndex(createIndex);
		this.searchService.setFilterableAttributes(createIndex.uid, [
			"deleted",
			"active"
		]);
		createIndex.uid = "category-" + objectId;
		this.searchService.addIndex(createIndex);
		this.searchService.setFilterableAttributes(createIndex.uid, [
			"deleted",
			"active"
		]);
		createIndex.uid = "channel-" + objectId;
		this.searchService.addIndex(createIndex);
		this.searchService.setFilterableAttributes(createIndex.uid, [
			"deleted",
			"active"
		]); */
		const channel = await this.getDefaultChannel(organizationId);
		if (channel === 'ERROR') {
      return;
    }
    const doc1: Document = [];
		doc1.push(channel);
    doc1[0].organizationId = organizationId;
		return this.searchService.addDocuments("channel", [doc1[0]]);
  }

	@OnQueueActive()
	onActive(job: Job) {
		this.logger.info(`[OrganizationProcessor] Job ${job.id}-${job.name} started. Data:`, job.data);
	}

	@OnQueueCompleted()
	async onCompleted(jobId: number, result: any) {
		// const job = await this.immediateQueue.getJob(jobId);
		this.logger.info('[OrganizationProcessor] Job ' + jobId.toString() + ' Completed -> result: ', result);
	}

}
