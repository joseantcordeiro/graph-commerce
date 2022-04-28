import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { BullModule } from '@nestjs/bull';

@Module({
	imports: [
		BullModule.registerQueue({
      name: 'search',
    }),
	],
  providers: [ChannelService],
  controllers: [ChannelController],
	exports: [],
})
export class ChannelModule {}
