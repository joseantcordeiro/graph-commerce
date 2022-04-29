import { Module } from '@nestjs/common';
import { MinioClientModule } from './minio-client.module';
import { ImageUploadController } from './image-upload.controller';
import { ImageUploadService } from './image-upload.service';

@Module({
  imports: [MinioClientModule],
  controllers: [ImageUploadController],
  providers: [ImageUploadService],
})
export class ImageUploadModule {}
