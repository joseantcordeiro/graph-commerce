import { CacheInterceptor, CacheTTL, Controller, Get, UseInterceptors } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
@UseInterceptors(CacheInterceptor)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @CacheTTL(86400)
  @Get()
  async getList() {
    const countries = await this.countriesService.list();

    return {
      results: countries.map((country) => country.toJson()),
    };
  }
}
