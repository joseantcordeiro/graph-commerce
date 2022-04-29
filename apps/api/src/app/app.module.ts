import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from '@graph-commerce/auth';
import { SearchModule, SearchController } from '@graph-commerce/search';
import { CoreModule } from '@graph-commerce/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { Neo4jModule } from 'nest-neo4j';
import * as redisStore from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';
import { MinioModule } from '@graph-commerce/minio';
import { HealthController } from '@graph-commerce/health';
import { DatabaseHealthIndicator } from '@graph-commerce/health';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.File({
            filename: `${process.cwd()}/${configService.get('LOG_API_PATH')}`,
          }),
          new winston.transports.Console({
            format: winston.format.combine(
							winston.format.colorize(),
              winston.format.timestamp(),
							winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('API', { prettyPrint: true }),
            ),
          }),
        ],
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
			isGlobal: true,
			useFactory: async (configService: ConfigService) => ({
					store: redisStore,
					host: configService.get('REDIS_HOST'),
					port: configService.get('REDIS_PORT'),
					password: configService.get('REDIS_PASSWORD'),
					db: configService.get('REDIS_DB'),
					// ttl: +configService.get('CACHE_TTL'),
					// max: +configService.get('MAX_ITEM_IN_CACHE')
			}),
			inject: [ConfigService],
		}),
		BullModule.forRootAsync({
			useFactory: async (configService: ConfigService) => ({
				redis: {
					host: configService.get('QUEUE_HOST'),
					port: +configService.get('QUEUE_PORT'),
					password: configService.get('QUEUE_PASSWORD'),
				},
			}),
			inject: [ConfigService],
		}),
    TerminusModule,
    MinioModule.fromEnv({ isGlobal: true }),
    Neo4jModule.fromEnv(),
    AuthModule.fromEnv(),
    SearchModule.fromEnv(),
    CoreModule,
  ],
  controllers: [AppController, HealthController, SearchController],
  providers: [AppService, DatabaseHealthIndicator],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

	/**
	async onApplicationShutdown(signal?: string) {
		if (signal) {
			Logger.info('Received shutdown signal:' + signal);
		}
	} */
}
