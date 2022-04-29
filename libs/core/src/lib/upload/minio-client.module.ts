import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioModule } from '@graph-commerce/minio';

@Module({
  imports: [
    MinioModule.fromEnv({ isGlobal: false }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
