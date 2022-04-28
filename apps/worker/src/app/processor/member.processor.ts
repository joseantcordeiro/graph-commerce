import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Processor('member')
export class MemberProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
		private readonly neo4jService: Neo4jService) {}

	private async getPermissions(objectId: string): Promise<string[]> {
		const res = await this.neo4jService.read(
				`MATCH (n { id: $objectId })-[r:HAS_METADATA]->(m:Metadata { key: 'ROLES' })
				RETURN m.value AS roles
				`,
				{	objectId },
		);
		return res.records.length ? res.records[0].get('roles') : [];
	}

	private async updatePermissions(memberId: string, roles: string[]): Promise<string[]> {
		const res = await this.neo4jService.write(
				`MATCH (n:Person { id: $memberId })-[r:HAS_METADATA]->(m:Metadata { key: 'ROLES' })
				SET m.value = $roles
				SET r.updatedAt = timestamp()
				RETURN m.value AS roles
				`,
				{	memberId, roles },
		);
		return res.records.length ? res.records[0].get('roles') : [];
	}

	@Process('update')
  async update(job: Job<unknown>) {
    this.logger.info(`[MemberProcessor] Job ${job.id}-update process. Data:`, job.data);
    return {};
  }

	@Process('create')
  async create(job: Job<unknown>) {
    this.logger.info(`[MemberProcessor] Job ${job.id}-create process. Data:`, job.data);
    return {};
  }

	@Process('delete')
  async delete(job: Job<unknown>) {
    this.logger.info(`[MemberProcessor] Job ${job.id}-delete process. Data:`, job.data);
    return {};
  }

	@Process('join')
	async join(job: Job) {
		if (job.data.object[0].type === 'PERMISSION') {
			const roles = await this.getPermissions(job.data.object[0].id);
			if (roles.length) {
				this.updatePermissions(job.data.memberId, roles);
				return roles;
			}
		}
		return {};
	}

	@OnQueueActive()
	onActive(job: Job) {
		this.logger.info(`[MemberProcessor] Job ${job.id}-${job.name} started. Data:`, job.data);
	}

	@OnQueueCompleted()
	async onGlobalCompleted(jobId: number, result: any) {
		// const job = await this.immediateQueue.getJob(jobId);
		this.logger.info('[MemberProcessor] Completed: job ', jobId, ' -> result: ', result);
	}

}
