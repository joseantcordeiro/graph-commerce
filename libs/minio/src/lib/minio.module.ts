import { Module, DynamicModule, Provider } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MINIO_CONFIG_OPTIONS } from './constants';
import { MinioConnectionAsyncOptions } from './interface/minio.async-options.interfaces';
import { MinioOptionsFactory } from './interface/minio.async-options.factory.interface';
import { ClientOptions } from 'minio';
import { ConfigService } from '@nestjs/config';

@Module({})
export class MinioModule {
  static register(options: ClientOptions & { global?: boolean }): DynamicModule {
    return {
      global: options.global,
      module: MinioModule,
      providers: [
        {
          provide: MINIO_CONFIG_OPTIONS,
          useValue: options,
        },
        MinioService,
      ],
      exports: [MinioModule, MinioService],
    };
  }

  public static registerAsync(
    options: MinioConnectionAsyncOptions,
  ): DynamicModule {
    const allImports = [...new Set([].concat(options.imports))];

    return {
      module: MinioModule,
      imports: allImports || [],
      providers: [this.createConnectAsyncProviders(options), MinioService],
      exports: [MinioModule, MinioService],
    };
  }

  private static createConnectAsyncProviders(
    options: MinioConnectionAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MINIO_CONFIG_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // For useClass and useExisting...
    return {
      provide: MINIO_CONFIG_OPTIONS,
      useFactory: async (optionsFactory: MinioOptionsFactory) =>
        await optionsFactory.createPiConnectionOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  static fromEnv(global: { isGlobal?: boolean }): DynamicModule {

    const options = {
			useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_ENDPOINT'),
        port: parseInt(configService.get('MINIO_PORT')),
        useSSL: false, // If on localhost, keep it at false. If deployed on https, change to true
        accessKey: configService.get('MINIO_ACCESS_KEY'),
        secretKey: configService.get('MINIO_SECRET_KEY'),
      }),
			inject: [ConfigService],
		};

    return {
      global: global.isGlobal,
      module: MinioModule,
      imports: [],
      providers: [this.createConnectAsyncProviders(options), MinioService],
      exports: [MinioModule, MinioService],
    };

  }

}

