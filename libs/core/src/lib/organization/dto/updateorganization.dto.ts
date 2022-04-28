import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrganizationDto {
	@IsNotEmpty()
	@IsString()
	organizationId: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
