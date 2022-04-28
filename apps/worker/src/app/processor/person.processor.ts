import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Person, CreatePersonDto } from '@graph-commerce/core';

@Processor('person')
export class PersonProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	private readonly neo4jService: Neo4jService) {}

	async addPerson(properties: CreatePersonDto) {
		const res = await this.neo4jService.write(
			`MATCH (l:Language { alpha_2: $properties.defaultLanguage })
			WITH l
			CREATE (p:Person { id: $properties.userId, name: $properties.name, email: $properties.email })
			CREATE (p)-[:HAS_DEFAULT_LANGUAGE]->(l)
			CREATE (m:Metadata { key: 'DEFAULT_ORGANIZATION', value: '' })
			CREATE (p)-[:HAS_METADATA { private: false }]->(m)
			CREATE (n:Metadata { key: 'ROLES', value: '[]' })
			CREATE (p)-[:HAS_METADATA { addedBy: $properties.userId, createdAt: datetime(), private: true }]->(n)
			RETURN p`
			, { properties });
			return res.records.length ? res.records.map((row) => new Person(row.get('p'))) : false;

	}

	@Process('update')
  async update(job: Job<unknown>) {
    this.logger.info(`[PersonProcessor] Job ${job.id}-update process. Data:`, job.data);
    return {};
  }

	@Process('create')
  async create(job: Job<unknown>) {
    this.logger.info(`[PersonProcessor] Job ${job.id}-create process. Data:`, job.data);
    return {};
  }

	@Process('delete')
  async delete(job: Job<unknown>) {
    this.logger.info(`[PersonProcessor] Job ${job.id}-delete process. Data:`, job.data);
    return {};
  }

	@Process('signup')
	async signup(job: Job) {
		const properties: CreatePersonDto = {
			organizationId: '',
			userId: job.data.id,
			email: job.data.email,
			name: '',
			defaultLanguage: 'en',
		};
		return this.addPerson(properties);
	}

	@Process('organizationdefault')
	async organizationDefault(job: Job) {
		this.logger.info(`[PersonProcessor] Job ${job.id}-organizationDefault process. Data:`, job.data);
		return {};
	}

	@OnQueueActive()
	onActive(job: Job) {
		this.logger.info(`[PersonProcessor] Job ${job.id}-${job.name} started. Data:`, job.data);
	}

	@OnQueueCompleted()
	async onGlobalCompleted(jobId: number, result: any) {
		// const job = await this.immediateQueue.getJob(jobId);
		this.logger.info('[PersonProcessor] (Global) on completed: job ', jobId, ' -> result: ', result);
	}

}
