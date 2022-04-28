import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Patch,
	HttpException,
	HttpStatus,
	UseInterceptors,
	CacheInterceptor,
	Param,
} from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/creategroup.dto';
import { UpdateGroupDto } from './dto/updategroup.dto';
import { AuthGuard, RolesGuard, Role, Roles, Session } from '@graph-commerce/auth';
import { SessionContainer } from 'supertokens-node/recipe/session';


@Controller('group')
@UseInterceptors(CacheInterceptor)
export class GroupController {
  	constructor(@InjectQueue('search') private readonly searchQueue: Queue,
		@InjectQueue('member') private readonly memberQueue: Queue,
		private readonly groupService: GroupService) {}

  @Get(':groupId')
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async getGroup(@Param('groupId') groupId: string) {
    const groups = await this.groupService.get(groupId);
		if (Array.isArray(groups)) {
			return {
				results: groups.map(m => m.toJson()),
			};
		}
		throw new HttpException('Group not found!', HttpStatus.NOT_FOUND);
  }

	@Get()
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async listGroups(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    const groups = await this.groupService.list(userId);
		if (Array.isArray(groups)) {
			return {
				results: groups.map(m => m.toJson()),
			};
		}
		throw new HttpException('You is not a manager of any group', HttpStatus.NOT_FOUND);
  }

  @Post()
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async postGroup(
		@Session() session: SessionContainer,
    @Body() properties: CreateGroupDto
  ) {
		const userId = session.getUserId();
    const groups = await this.groupService.create(userId, properties);
		if (Array.isArray(groups)) {
			this.searchQueue.add('create', {
				objectType: 'group',
				object: groups.map(m => m.toJson()),
			});
			return {
				results: groups.map(m => m.toJson()),
			};
		}
		throw new HttpException('Group couldn\'t be created', HttpStatus.NOT_MODIFIED);
  }

  @Patch()
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async patchGroup(
    @Body() properties: UpdateGroupDto,
  ) {
		const groups = await this.groupService.update(properties);
		if (Array.isArray(groups)) {
			this.searchQueue.add('update', {
				objectType: 'group',
				object: groups.map(m => m.toJson()),
			});
			return {
				results: groups.map(m => m.toJson()),
			};
		}
		throw new HttpException('Group couldn\'t be updated', HttpStatus.NOT_MODIFIED);
  }

  @Delete(':groupId')
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async deleteGroup(@Session() session: SessionContainer,
		@Param('groupId') groupId: string) {
    const userId = session.getUserId();
    const groups = await this.groupService.delete(userId, groupId);
		if (Array.isArray(groups)) {
			this.searchQueue.add('delete', {
				objectType: 'group',
				object: groups.map(m => m.toJson()),
			});
			return {
				message: 'Group marked to delete',
				results: groups.map(c => c.toJson()),
			}
		}
		throw new HttpException('Group couldn\'t be deleted', HttpStatus.NOT_MODIFIED);
	}

	@Post(':groupId/join/:memberId')
	@UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
	async joinGroup(@Session() session: SessionContainer,
		@Param('groupId') groupId: string, @Param('memberId') memberId: string) {
		const userId = session.getUserId();
		const groups = await this.groupService.join(userId, memberId, groupId);
		if (Array.isArray(groups)) {
			this.memberQueue.add('join', {
				objectType: 'group',
				memberId: memberId,
				object: groups.map(m => m.toJson()),
			});
			return {
				results: groups.map(m => m.toJson()),
			};
		}
		throw new HttpException('Group couldn\'t be updated', HttpStatus.NOT_MODIFIED);
	}
}
