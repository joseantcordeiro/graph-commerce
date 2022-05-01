import { Body, CacheInterceptor, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ConfigurationService } from './configuration.service';
import { AuthGuard } from '@graph-commerce/auth';

@Controller('configuration')
@UseInterceptors(CacheInterceptor)
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

	@Patch()
	async updateMetadata(
		@Body() properties: UpdateConfigurationDto,
	) {
		const metadata = await this.configurationService.updateMetadata(properties);
		if (metadata !== false) {
			return metadata;
		}
		throw new HttpException('Configuration couldn\'t be updated', HttpStatus.NOT_MODIFIED);
	}

  @Get(':objectId/:key')
	@UseGuards(AuthGuard)
  async getConfiguration(
    @Param('objectId') objectId: string,
    @Param('key') key: string,
  ) {
    const metadata = await this.configurationService.getConfiguration(objectId, key);
		if (metadata !== false) {
			return metadata;
		}
		throw new HttpException('Configuration couldn\'t be found', HttpStatus.NOT_FOUND);
  }

  @Get(':objectId')
  @UseGuards(AuthGuard)
  async getConfigurationByObjectId(
    @Param('objectId') objectId: string,
  ) {
    const metadata = await this.configurationService.getConfigurationByObjectId(objectId);
    if (Array.isArray(metadata)) {
      return {
        objectId: objectId,
        configuration: metadata.map(m => m.toJson()),
      }
    }
    throw new HttpException('Configuration couldn\'t be found', HttpStatus.NOT_FOUND);
  }
}
