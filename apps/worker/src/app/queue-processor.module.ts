import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SearchProcessor } from './processor/search.processor';
import { MailProcessor } from './processor/mail.processor';
import { PersonProcessor } from './processor/person.processor';
import { PictureProcessor } from './processor/picture.processor';
import { OrganizationProcessor } from './processor/organization.processor';
import { MemberProcessor } from './processor/member.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'person',
    }),
		BullModule.registerQueue({
      name: 'mail',
    }),
		BullModule.registerQueue({
      name: 'picture',
    }),
		BullModule.registerQueue({
      name: 'search',
    }),
		BullModule.registerQueue({
      name: 'organization',
    }),
		BullModule.registerQueue({
      name: 'member',
    }),
  ],
  controllers: [],
  providers: [PersonProcessor,
		MailProcessor,
		PictureProcessor,
		SearchProcessor,
		OrganizationProcessor,
		MemberProcessor,
	],
})
export class QueueProcessorModule {}
