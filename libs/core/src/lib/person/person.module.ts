import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { BullModule } from '@nestjs/bull';

@Module({
	imports: [
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
