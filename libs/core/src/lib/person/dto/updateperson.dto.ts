import { IsNotEmpty, IsString, IsEmail, Length, MinLength } from 'class-validator';

export class UpdatePersonDto {
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
    message: 'Use at least 8 characters',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
	@Length(2, 2, {
    message: 'Use a valid alpha 2 language code',
  })
  defaultLanguage: string;
}
