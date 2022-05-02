import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { BullModule } from '@nestjs/bull';

@Module({
	imports: [
    BullModule.registerQueue({
      name: 'search',
    }),
		BullModule.registerQueue({
      name: 'team',
    }),
	],
  providers: [TeamService],
  controllers: [TeamController],
	exports: [],
})
export class TeamModule {}
