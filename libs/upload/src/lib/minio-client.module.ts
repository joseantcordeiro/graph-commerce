import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioService } from './config/config.service';

@Module({
  imports: [],
  providers: [MinioClientService, MinioService],
  controllers: [],
  exports: [],
})
export class MinioClientModule {}

