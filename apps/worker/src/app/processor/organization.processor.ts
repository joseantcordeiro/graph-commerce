import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Document } from 'meilisearch';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Channel } from '@graph-commerce/core';
import { SearchService, CreateIndexDto } from '@graph-commerce/search';

@Processor('organization')
export class OrganizationProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
		private readonly searchService: SearchService,
		private readonly neo4jService: Neo4jService) {}

		async getDefaultChannel(objectId: string): Promise<Channel[] | any> {
			const res = await this.neo4jService.read(
				`
				MATCH (c:Channel)-[:BELONGS_TO]->(o:Organization { id: $objectId })
				RETURN c
				`,
				{ objectId },
			);
			return res.records.length ? res.records.map((row) => new Channel(row.get('c'))) : 'ERROR';

		}

	@Process('update')
  async update(job: Job) {
    const doc: Document = job.data.organization;
		const index = "organization";
		return this.searchService.updateDocuments(index, [doc[0]]);
  }

	@Process('create')
  async create(job: Job) {
		let doc: Document = job.data.organization;
		let index = "organization";
		this.searchService.addDocuments(index, [doc[0]])
		const objectId = doc[0].id;
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
		]);
		const channel = await this.getDefaultChannel(objectId);
		if (channel === 'ERROR')
			return
		doc = channel.map(m => m.toJson());
		doc[0].active = true;
		doc[0].deleted = false;
		index = 'channel-' + objectId;
		return this.searchService.addDocuments(index, [doc[0]]);
  }

	@Process('delete')
  async delete(job: Job) {
    this.logger.info(`[OrganizationProcessor] Job ${job.id}-delete process. Data:`, job.data);
    return {};
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
