import {
  Body,
  CacheInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/createperson.dto';
import { UpdatePersonDto } from './dto/updateperson.dto';
import { PersonService } from './person.service';
import { AuthGuard, Session } from '@graph-commerce/auth';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from '../upload/entity/image.entity';
import { FindPersonDto } from '../organization/dto/findperson.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('person')
@UseInterceptors(CacheInterceptor)
export class PersonController {
  constructor(private readonly personService: PersonService,
		@InjectQueue('mail') private readonly mailQueue: Queue,
		@InjectQueue('person') private readonly personQueue: Queue) {}

  @Post()
	@UseGuards(AuthGuard)
  async postPerson(
    @Session() session: SessionContainer,
    @Body() properties: CreatePersonDto,
  ) {
    const userId = session.getUserId();
		if (userId === properties.userId) {
			const person = await this.personService.create(properties);
			if (Array.isArray(person)) {
				this.personQueue.add('create', {
					person,
				});
				this.mailQueue.add('welcome', {
					email: person[0].getEmail(),
					name: person[0].getName(),
				});
				return {
					results: person.map(m => m.toJson()),
				};
			}
		}
		throw new HttpException('Person couldn\'t be created', HttpStatus.NOT_MODIFIED);
  }

  @Get()
	@UseGuards(AuthGuard)
  async getPerson(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    const person = await this.personService.get(userId);
		if (Array.isArray(person)) {
			return {
				results: person.map(m => m.toJson()),
			};
		}
		throw new HttpException('Something is wrong, try to refresh the session.', HttpStatus.NOT_FOUND);
  }

	@Get('find')
	@UseGuards(AuthGuard)
	async findPerson(@Body() properties: FindPersonDto) {
		const person = await this.personService.find(properties);
		if (Array.isArray(person)) {
			return {
				results: person.map(m => m.toJson()),
			};
		}
		throw new HttpException('Person not found in current organization', HttpStatus.NOT_FOUND);
	}

	@Get('roles')
	@UseGuards(AuthGuard)
	async getRoles(@Session() session: SessionContainer) {
		const userId = session.getUserId();
		const roles = await this.personService.getRoles(userId);
		if (Array.isArray(roles)) {
			return {
				roles
			};
		}
		throw new HttpException('Something is wrong, try to refresh the session.', HttpStatus.NOT_FOUND);
	}

  @Patch()
	@UseGuards(AuthGuard)
  async patchPerson(
    @Session() session: SessionContainer,
    @Body() properties: UpdatePersonDto,
  ) {
    const userId = session.getUserId();
    if (userId === properties.userId) {
    	const person = await this.personService.update(properties);
			if (Array.isArray(person)) {
				this.personQueue.add('update', {
					userId: userId, person: person,
				});
				return {
					results: person.map(m => m.toJson()),
				};
			}
			throw new HttpException('Person couldn\'t be updated', HttpStatus.NOT_MODIFIED);
    }
		throw new HttpException('You need to be the signup user', HttpStatus.FORBIDDEN);
  }

	@Post('organization')
	@UseGuards(AuthGuard)
	async makeDefaultOrganization(@Session() session: SessionContainer,
		@Body() properties: {organizationId: string}) {
		const userId = session.getUserId();
		const defaultOrganization = await this.personService.makeDefaultOrganization(userId, properties.organizationId);
		if (Array.isArray(defaultOrganization)) {
			this.personQueue.add('organizationdefault', {
				userId: userId, organization: defaultOrganization,
			});
			return {
				results: defaultOrganization.map(m => m.toJson()),
			};
		}
		throw new HttpException('Something is wrong, try to refresh the session.', HttpStatus.NOT_FOUND);
	}

	@Get('organization')
	@UseGuards(AuthGuard)
	async getOrganization(@Session() session: SessionContainer) {
		const userId = session.getUserId();
		const defaultOrganization = await this.personService.organization(userId);
		if (Array.isArray(defaultOrganization)) {
			return {
				results: defaultOrganization.map(m => m.toJson()),
			};
		}
		throw new HttpException('Something is wrong, try to refresh the session.', HttpStatus.NOT_FOUND);
	}

  @Delete()
	@UseGuards(AuthGuard)
  async deletePerson(@Session() session: SessionContainer) {
    const userId = session.getUserId();
    const deleted = await this.personService.delete(userId);
		this.personQueue.add('update', {
			userId: userId, person: deleted,
		});
    return {
      ...deleted.toJson(),
    };
  }

	@Post('picture')
	@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor('image'))
	async uploadAvatar(@Session() session: SessionContainer, @UploadedFile() image: BufferedFile) {
		return this.personService.uploadPicture(session.getUserId(), image);
	}
}
