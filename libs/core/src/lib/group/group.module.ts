import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { BullModule } from '@nestjs/bull';

@Module({
	imports: [
		BullModule.registerQueue({
      name: 'search',
    }),
		BullModule.registerQueue({
      name: 'member',
    }),
	],
  providers: [GroupService],
  controllers: [GroupController],
	exports: [],
})
export class GroupModule {}
