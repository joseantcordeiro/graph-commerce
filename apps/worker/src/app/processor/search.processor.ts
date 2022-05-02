import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Document } from 'meilisearch';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SearchService } from '@graph-commerce/search';

@Processor('search')
export class SearchProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
		private readonly neo4jService: Neo4jService,
		private readonly searchService: SearchService) {
	}

	getOrganization(objectId: string): Promise<string> {
		return this.neo4jService.read(
			`
			MATCH (n { id: $objectId })-[:BELONGS_TO]->(o:Organization)
			RETURN o.id
			`,
			{ objectId },
		).then((res) => {
			if (res.records.length) {
				return res.records[0].get('o.id');
			}
			return 'ERROR';
		});

	}

	@Process('update')
  async update(job: Job) {
    const doc: Document = [];
		doc.push(job.data.object);
		return this.searchService.updateDocuments(job.data.objectType, [doc[0]]);
  }

	@Process('create')
  async create(job: Job) {
		const doc: Document = [];
		doc.push(job.data.object);
		const organizationId = await this.getOrganization(doc[0].id);
		if (organizationId === 'ERROR') {
      return;
    }
    doc[0].organizationId = organizationId;
		return this.searchService.addDocuments(job.data.objectType, [doc[0]]);
  }

	@Process('parent')
  async parent(job: Job) {
    const doc: Document = [];
		doc.push(job.data.object);
		doc[0].parentId = job.data.parentId;
		return this.searchService.updateDocuments(job.data.objectType, [doc[0]]);
  }

	@OnQueueActive()
	async onActive(job: Job) {
		this.logger.info(`[SearchProcessor] Job ${job.id} started. Data:`, job.data);
	}

	@OnQueueCompleted()
	async onGlobalCompleted(jobId: number, result: any) {
		this.logger.info('[SearchProcessor] Job ' + jobId.toString() + ' Completed -> result: ', result);
	}

}
