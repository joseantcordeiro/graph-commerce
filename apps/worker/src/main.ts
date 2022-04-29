/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await import('./app/app.module').then(({ AppModule }) => {
		return NestFactory.create(AppModule);
	});

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = process.env.PORT || 3334;
  await app.listen(port);
  Logger.log(
    `🚀 Worker is running on: http://localhost:${port}`
  );
}

bootstrap();
