import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module';
import { LanguageModule } from './language/language.module';
import { CurrencyModule } from './currency/currency.module';
import { OrganizationModule } from './organization/organization.module';
import { PersonModule } from './person/person.module';
import { GroupModule } from './group/group.module';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [
    CountryModule,
    LanguageModule,
    CurrencyModule,
    PersonModule,
    OrganizationModule,
    GroupModule,
    ChannelModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
