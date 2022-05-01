import {
  Body,
  CacheInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
	UseInterceptors,
} from '@nestjs/common';

import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
/** import { AddUserTeamDto } from './dto/addUser-team.dto';
import { RemoveUserTeamDto } from './dto/removeUser-team.dto'; */
import { TeamService } from './team.service';
import { AuthGuard, Role, Roles, RolesGuard, Session } from '@graph-commerce/auth';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('team')
@UseInterceptors(CacheInterceptor)
export class TeamController {
  constructor(@InjectQueue('team') private readonly teamQueue: Queue,
		private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async postTeam(
    @Session() session: SessionContainer,
    @Body() properties: CreateTeamDto,
  ) {
		const userId = session.getUserId();
    const team = await this.teamService.create(
      userId,
      properties,
    );

		if (team !== false) {
			this.teamQueue.add('create', {
				userId: userId, team: team,
			});
			return team;
		}
		throw new HttpException('Team couldn\'t be created', HttpStatus.NOT_MODIFIED);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async patchTeam(
		@Session() session: SessionContainer,
    @Body() properties: UpdateTeamDto,
  ) {
		const userId = session.getUserId();
		const team = await this.teamService.update(properties);
		if (team !== false) {
			this.teamQueue.add('update', {
				userId: userId, team: team,
			});
			return team;
		}
		throw new HttpException('Team couldn\'t be updated', HttpStatus.NOT_MODIFIED);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async getTeam(@Session() session: SessionContainer) {
		const userId = session.getUserId();
    const teams = await this.teamService.get(userId);
		if (Array.isArray(teams)) {
			return {
				results: teams.map(m => m.toJson()),
			};
		}
		throw new HttpException('You organization do not have any team', HttpStatus.NOT_FOUND);
  }

  @Get(':teamId')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async getTeamById(@Param('teamId') teamId: string) {
    const team = await this.teamService.getById(teamId);
		if (team !== false) {
      return team;
    }
		throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
  }

  @Patch(':teamId/enable')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async enableTeam(
    @Param('teamId') teamId: string) {
    const team = await this.teamService.enable(teamId);
    if (team !== false) {
      return team;
    }
    throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
  }

  @Patch(':teamId/disable')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async disableTeam(
    @Param('teamId') teamId: string) {
    const team = await this.teamService.disable(teamId);
    if (team !== false) {
      return team;
    }
    throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
  }

  @Delete(':teamId')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
	@UseGuards(RolesGuard)
  async deleteTeam(
    @Param('teamId') teamId: string) {
    const team = await this.teamService.delete(teamId);
    if (team !== false) {
      return {
        message: 'Team deleted successfully',
        team: team
      };
    }
    throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
  }

  @Patch(':teamId/add/:userId')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
  @UseGuards(RolesGuard)
  async addMemberToTeam(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string) {
    const team = await this.teamService.addMember(teamId, userId);
    if (team !== false) {
      this.teamQueue.add('add_permissions', {
				userId: userId, teamId: teamId,
			});
      return team;
    }
    throw new HttpException('Team or person not found', HttpStatus.NOT_FOUND);
  }

  @Patch(':teamId/remove/:userId')
  @UseGuards(AuthGuard)
  @Roles(Role.MANAGE_ORGANIZATION)
  @UseGuards(RolesGuard)
  async removeMemberFromTeam(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string) {
    const team = await this.teamService.removeMember(teamId, userId);
    if (team !== false) {
      this.teamQueue.add('remove_permissions', {
				userId: userId, teamId: teamId,
			});
      return team;
    }
    throw new HttpException('Team or person not found', HttpStatus.NOT_FOUND);
  }

}
