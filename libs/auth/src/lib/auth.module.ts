import {
  MiddlewareConsumer,
  Module,
  NestModule,
  DynamicModule,
} from '@nestjs/common';

import { AuthMiddleware } from './middleware/auth.middleware';
import { ConfigInjectionToken, AuthModuleConfig } from './config/auth.config';
import { SupertokensService } from './supertokens.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [],
  providers: [SupertokensService, AuthService],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }

  static forRoot({
    connectionURI,
    apiKey,
    appInfo,
  }: AuthModuleConfig): DynamicModule {
    return {
      providers: [
        {
          useValue: {
            appInfo,
            connectionURI,
            apiKey,
          },
          provide: ConfigInjectionToken,
        },
      ],
      exports: [],
      imports: [],
      module: AuthModule,
    };
  }

	static fromEnv(): DynamicModule {
		const config = new ConfigService()
		const appInfo = {
			appName: config.get<string>('AUTH_APP_NAME'),
			apiDomain: config.get<string>('AUTH_API_DOMAIN'),
			websiteDomain: config.get<string>('AUTH_WEBSITE_DOMAIN')
		}
		const connectionURI = config.get<string>('AUTH_URI');
		const apiKey = config.get<string>('AUTH_API_KEY');
		return {
			providers: [
        {
          useValue: {
            appInfo,
            connectionURI,
            apiKey,
          },
          provide: ConfigInjectionToken,
        },
      ],
      exports: [],
      imports: [],
      module: AuthModule,
		}
	}
}

