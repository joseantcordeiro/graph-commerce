import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Neo4jService } from 'nest-neo4j';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Processor('team')
export class TeamProcessor {
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

  @Process('add_permissions')
  async addPermissions(job: Job) {
    this.logger.info(`[MemberProcessor] Job ${job.id}-add_permissions process. Data:`, job.data);
    const userRoles = await this.getPermissions(job.data.userId);
    const teamRoles = await this.getPermissions(job.data.teamId);
    return this.updatePermissions(job.data.userId, Array.from(new Set(userRoles.concat(teamRoles))));
  }

  @Process('remove_permissions')
  async removePermissions(job: Job) {
    this.logger.info(`[MemberProcessor] Job ${job.id}-delete process. Data:`, job.data);
    const userRoles = await this.getPermissions(job.data.userId);
    const teamRoles = await this.getPermissions(job.data.teamId);
    for (const role of teamRoles) {
      const index = userRoles.indexOf(role);
      if (index !== -1) {
        userRoles.splice(index, 1);
      }
    }
    return this.updatePermissions(job.data.userId, userRoles);
  }

	@Process('update')
  async update(job: Job<unknown>) {
    this.logger.info(`[TeamProcessor] Job ${job.id}-update process. Data:`, job.data);
    return {};
  }

	@Process('create')
  async create(job: Job<unknown>) {
    this.logger.info(`[TeamProcessor] Job ${job.id}-create process. Data:`, job.data);
    return {};
  }

	@Process('delete')
  async delete(job: Job<unknown>) {
    this.logger.info(`[TeamProcessor] Job ${job.id}-delete process. Data:`, job.data);
    return {};
  }

	@OnQueueActive()
	onActive(job: Job) {
		this.logger.info(`[TeamProcessor] Job ${job.id}-${job.name} started. Data:`, job.data);
	}

	@OnQueueCompleted()
	async onGlobalCompleted(jobId: number, result: any) {
		// const job = await this.immediateQueue.getJob(jobId);
		this.logger.info('[TeamProcessor] Job completed: job ' + jobId.toString() + ' -> result: ', result);
	}

}
