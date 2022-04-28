import {
  Module,
  DynamicModule,
	Provider,
	Global
} from '@nestjs/common';
import { MEILI_CLIENT, MEILI_MODULE_OPTIONS } from './config/search.config';
import { createConnectionFactory, createAsyncProviders } from './provider/search.provider';
import { SearchService } from './search.service';
import { ConfigService } from '@nestjs/config';
import { MeiliModuleAsyncOptions, MeiliModuleOptions } from './interface/search.interface';

@Global()
@Module({})
export class SearchModule {

  public static forRoot(options: MeiliModuleOptions): DynamicModule {
    const meiliOptions: Provider = {
      provide: MEILI_MODULE_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      provide: MEILI_CLIENT,
      useFactory: async () =>
        createConnectionFactory({
          host: 'http://127.0.0.1:7700',
          apiKey: '12131211',
        }),
    };
    return {
      module: SearchModule,
      providers: [meiliOptions, connectionProvider, SearchService],
      exports: [connectionProvider, SearchService],
    };
  }

  public static forRootAsync(options: MeiliModuleAsyncOptions): DynamicModule {
    const connectionProvider: Provider = {
      provide: MEILI_CLIENT,
      useFactory: async (meiliOptions: MeiliModuleOptions) =>
        createConnectionFactory(meiliOptions),
      inject: [MEILI_MODULE_OPTIONS],
    };

    const asyncProviders = createAsyncProviders(options);

    return {
      module: SearchModule,
      imports: options.imports || [],
      providers: [...asyncProviders, connectionProvider, SearchService],
      exports: [connectionProvider, SearchService],
    };
  }

	static fromEnv(): DynamicModule {

		const options: MeiliModuleAsyncOptions = {
			useFactory: async (config: ConfigService) => ({
				host: config.get('SEARCH_HOST'),
				apiKey: config.get('SEARCH_KEY'),
			}),
			inject: [ConfigService],
		};

		const connectionProvider: Provider = {
      provide: MEILI_CLIENT,
      useFactory: async (meiliOptions: MeiliModuleOptions) =>
        createConnectionFactory(meiliOptions),
      inject: [MEILI_MODULE_OPTIONS],
    };

    const asyncProviders = createAsyncProviders(options);

    return {
      module: SearchModule,
      imports: options.imports || [],
      providers: [...asyncProviders, connectionProvider, SearchService],
      exports: [connectionProvider, SearchService],
    };
	}
}
