/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, RequestMethod, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import supertokens from 'supertokens-node';
import { SupertokensExceptionFilter } from '@graph-commerce/auth';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await import('./app/app.module').then(({ AppModule }) => {
		return NestFactory.create(AppModule);
	});

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [configService.get('AUTH_WEBSITE_DOMAIN')],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  app.enableVersioning({
		type: VersioningType.URI,
	});

  const globalPrefix = 'api/v1';
	app.setGlobalPrefix(globalPrefix, {
		exclude: [{ path: 'health', method: RequestMethod.GET }], // replace your endpoints in the place of health!
	});

  app.useGlobalFilters(new SupertokensExceptionFilter());

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
