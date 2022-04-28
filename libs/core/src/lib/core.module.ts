import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { PersonModule } from './person/person.module';

@Module({
  imports: [
    PersonModule,
    OrganizationModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
