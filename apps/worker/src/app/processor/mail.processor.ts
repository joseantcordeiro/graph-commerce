import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Processor('mail')
export class MailProcessor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
							private mailerService: MailerService) {}

  @Process('welcome')
  handleWelcome(job: Job) {
    this.logger.info('Start send welcome mail...');
		const url = `http://localhost:3333/auth`;
		this.mailerService.sendMail({
      to: job.data.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Graph Commerce!',
      template: 'welcome', // `.hbs` extension is appended automatically
      context: { // ✏️ filling curly brackets with content
        name: job.data.name,
        url,
      },
    });
    this.logger.info('Sending welcome mail completed');
  }
}
