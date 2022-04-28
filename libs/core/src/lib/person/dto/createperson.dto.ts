import { IsNotEmpty, IsString, IsEmail, MaxLength, MinLength } from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

	@IsNotEmpty()
	@IsEmail()
	email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'Use at least 8 characters to create a new tenant',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'Use a valid alpha 2 language code',
  })
  @MaxLength(2, {
    message: 'Use a valid alpha 2 language code',
  })
  defaultLanguage: string;
}
