import { Body, CacheInterceptor, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Session, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { DeleteMetadataDto } from './dto/delete-metadata.dto';
import { GetMetadataDto } from './dto/get-metadata.dto';
import { MetadataService } from './metadata.service';
import { AuthGuard } from '@graph-commerce/auth';
import { SessionContainer } from 'supertokens-node/recipe/session';

@Controller('metadata')
@UseInterceptors(CacheInterceptor)
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Post()
	@UseGuards(AuthGuard)
  async postMetadata(
		@Session() session: SessionContainer,
    @Body() properties: CreateMetadataDto,
  ) {
		const userId = session.getUserId();
		let metadata = await this.metadataService.getMetadata(properties);
		if (Array.isArray(metadata)) {
			throw new HttpException('Metadata with this key already exists for the object', HttpStatus.BAD_REQUEST);
		}
    metadata = await this.metadataService.createMetadata(userId, properties);
		if (Array.isArray(metadata)) {
			return {
				objectId: properties.objectId,
				metadata: metadata.map(m => m.toJson()),
			};
		}
		throw new HttpException('Metadata couldn\'t be added', HttpStatus.NOT_MODIFIED);
  }

  @Delete()
	@UseGuards(AuthGuard)
  async deleteMetadata(
    @Body() properties: DeleteMetadataDto,
  ) {
    await this.metadataService.deleteMetadata(properties);
		return {
			objectId: properties.objectId,
			key: properties.key,
			message: 'Metadata deleted',
		}
  }

	@Patch()
	async updateMetadata(
		@Body() properties: UpdateMetadataDto,
	) {
		const metadata = await this.metadataService.updateMetadata(properties);
		if (Array.isArray(metadata)) {
			return {
				objectId: properties.objectId,
				metadata: metadata.map(m => m.toJson()),
			};
		}
		throw new HttpException('Metadata couldn\'t be updated', HttpStatus.NOT_MODIFIED);
	}

  @Get()
	@UseGuards(AuthGuard)
  async getMetadata(
    @Body() properties: GetMetadataDto,
  ) {
    const metadata = await this.metadataService.getMetadata(properties);
		if (Array.isArray(metadata)) {
			return {
				objectId: properties.objectId,
				metadata: metadata.map(m => m.toJson()),
			};
		}
		throw new HttpException('Metadata couldn\'t be found', HttpStatus.NOT_FOUND);
  }

	@Get('public/:objectId')
  async getPublicMetadata(
    @Param('objectId') objectId: string,
  ) {
    const metadata = await this.metadataService.getPublicMetadata(objectId);
		if (Array.isArray(metadata)) {
			return {
				objectId: objectId,
				metadata: metadata.map(m => m.toJson()),
			};
		}
		throw new HttpException('Metadata couldn\'t be found', HttpStatus.NOT_FOUND);
  }

	@Get('private/:objectId')
	@UseGuards(AuthGuard)
  async getPrivateMetadata(
    @Param('objectId') objectId: string,
  ) {
    const metadata = await this.metadataService.getPrivateMetadata(objectId);
		if (Array.isArray(metadata)) {
			return {
				objectId: objectId,
				metadata: metadata.map(m => m.toJson()),
			};
		}
		throw new HttpException('Metadata couldn\'t be found', HttpStatus.NOT_FOUND);
  }
}
