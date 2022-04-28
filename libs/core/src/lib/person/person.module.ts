import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { MinioClientModule } from '@graph-commerce/upload';
import { BullModule } from '@nestjs/bull';

@Module({
	imports: [
		MinioClientModule,
		BullModule.registerQueue({
      name: 'person',
    }),
		BullModule.registerQueue({
      name: 'picture',
    }),
		BullModule.registerQueue({
      name: 'mail',
    }),
	],
  providers: [PersonService],
  controllers: [PersonController],
	exports: [],
})
export class PersonModule {}
