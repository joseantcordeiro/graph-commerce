import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Document } from 'meilisearch';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SearchService } from '@graph-commerce/search';

@Processor('channel')
export class ChannelProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
		private readonly neo4jService: Neo4jService,
		private readonly searchService: SearchService) {
	}

	getIndex(channelId: string): Promise<string> {
		return this.neo4jService.read(
			`
			MATCH (c:Channel { id: $channelId })<-[:HAS_CHANNEL]-(o:Organization)
			RETURN o.id
			`,
			{ channelId },
		).then((res) => {
			if (res.records.length) {
				return res.records[0].get('o.id');
			}
			return 'ERROR';
		});

	}

	@Process('update')
  async update(job: Job) {
    const doc: Document = job.data.channel;
		let index = await this.getIndex(doc[0].id);
		if (index === 'ERROR')
			return;
		index = "channel-" + index;
		return this.searchService.updateDocuments(index, [doc[0]]);
  }

	@Process('create')
  async create(job: Job): Promise<any> {
		const doc: Document = job.data.channel;
		let index = await this.getIndex(doc[0].id);
		if (index === 'ERROR')
			return;
		index = "channel-" + index;
		return this.searchService.addDocuments(index, [doc[0]]);
  }

	@Process('delete')
  async delete(job: Job<unknown>) {
    this.logger.info(`[ChannelProcessor] Job ${job.id}-delete process. Data:`, job.data);
    return {};
  }

	@OnQueueActive()
	onActive(job: Job<unknown>) {
		this.logger.info(`[ChannelProcessor] Job ${job.id} started. Data:`, job.data);
	}

	@OnQueueCompleted()
	async onCompleted(jobId: number, result: any) {
		// const job = await this.immediateQueue.getJob(jobId);
		this.logger.info('[ChannelProcessor] Job ' + jobId.toString() + ' Completed -> result: ', result);
	}

}
