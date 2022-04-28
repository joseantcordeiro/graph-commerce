import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Use at least 8 characters to create a new tenant',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, {
    message: 'Use a valid ISO 2 country code',
  })
  defaultCountry: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3, {
    message: 'Use a valid 3 character currency code',
  })
  defaultCurrency: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, {
    message: 'Use a valid alpha 2 language code',
  })
  defaultLanguage: string;
}
