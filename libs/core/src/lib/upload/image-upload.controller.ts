import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
	UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadService } from './image-upload.service';
import { BufferedFile } from './entity/image.entity';
import { AuthGuard } from '@graph-commerce/auth';

@Controller('image-upload')
export class ImageUploadController {
  constructor(private imageUploadService: ImageUploadService) {}

	@UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: BufferedFile) {
    return this.imageUploadService.uploadImage(image);
  }

}
