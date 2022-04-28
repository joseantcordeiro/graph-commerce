import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { BullModule } from '@nestjs/bull';

@Module({
	imports: [
		BullModule.registerQueue({
      name: 'organization',
    }),
	],
  providers: [OrganizationService],
  controllers: [OrganizationController]
})
export class OrganizationModule {}
