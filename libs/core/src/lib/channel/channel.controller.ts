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
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { AuthGuard, RolesGuard, Roles, Role, Session } from '@graph-commerce/auth';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { DeleteChannelDto } from './dto/delete-channel.dto';


@Controller('channel')
@UseInterceptors(CacheInterceptor)
export class ChannelController {
  	constructor(@InjectQueue('search') private readonly searchQueue: Queue,
		private readonly channelService: ChannelService) {}

  @Get(':channelId')
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION, Role.MANAGE_CHANNELS)
	@UseGuards(RolesGuard)
  async getChannel(@Param('channelId') channelId: string) {
    const channels = await this.channelService.get(channelId);
		if (Array.isArray(channels)) {
			return {
				results: channels.map(m => m.toJson()),
			};
		}
		throw new HttpException('Channel not found!', HttpStatus.NOT_FOUND);
  }

	@Get()
  @UseGuards(AuthGuard)
  async listChannels(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    const channels = await this.channelService.list(userId);
		if (Array.isArray(channels)) {
			return {
				results: channels.map(m => m.toJson()),
			};
		}
		throw new HttpException('You is not a manager of any channel', HttpStatus.NOT_FOUND);
  }

  @Post()
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION, Role.MANAGE_CHANNELS)
	@UseGuards(RolesGuard)
  async postChannel(
		@Session() session: SessionContainer,
    @Body() properties: CreateChannelDto
  ) {
		const userId = session.getUserId();
    const channels = await this.channelService.create(userId, properties);
		if (Array.isArray(channels)) {
			this.searchQueue.add('create', {
				objectType: 'channel',
				object: channels.map(m => m.toJson()),
			});
			return {
				results: channels.map(m => m.toJson()),
			};
		}
		throw new HttpException('Channel couldn\'t be created', HttpStatus.NOT_MODIFIED);
  }

  @Patch()
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION, Role.MANAGE_CHANNELS)
	@UseGuards(RolesGuard)
  async patchChannel(
    @Body() properties: UpdateChannelDto,
  ) {
		const channels = await this.channelService.update(properties);
		if (Array.isArray(channels)) {
			this.searchQueue.add('update', {
				objectType: 'channel',
				object: channels.map(m => m.toJson()),
			});
			return {
				results: channels.map(m => m.toJson()),
			};
		}
		throw new HttpException('Organization couldn\'t be updated', HttpStatus.NOT_MODIFIED);
  }

  @Delete()
  @UseGuards(AuthGuard)
	@Roles(Role.MANAGE_ORGANIZATION, Role.MANAGE_CHANNELS)
	@UseGuards(RolesGuard)
  async deleteChannel(@Session() session: SessionContainer,
		@Body() properties: DeleteChannelDto,
	) {
    const userId = session.getUserId();
    const channels = this.channelService.delete(userId, properties);
		if (Array.isArray(channels)) {
			this.searchQueue.add('delete', {
				objectType: 'channel',
				object: channels.map(m => m.toJson()),
			});
			return {
				message: 'Channel marked to delete',
				results: channels.map(c => c.toJson()),
			}
		}
		throw new HttpException('Channel couldn\'t be deleted', HttpStatus.NOT_MODIFIED);
	}
}
