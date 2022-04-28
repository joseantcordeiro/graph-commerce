import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
/** var sharp = require('sharp');
var request = require('request').defaults({encoding: null}); */

@Processor('picture')
export class PictureProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  @Process('resize')
  handleResize(job: Job) {
		/** module.exports = function (_image: string) {
			request(job.data.image, async function (_error, _response, body) {
			var fileInstance24x24 = sharp(body)
			var inst24x24 = fileInstance24x24.resize(24, 24)
			const uploaded_image = await this.minioClientService.upload(inst24x24);
			})
		} */
    this.logger.info('Start resize...');
    this.logger.info('Data: ', job.data);
    this.logger.info('Resizing completed');
  }
}
