import { IsNotEmpty } from 'class-validator';

export class UpdateTeamDto {

	organizationId?: string;
  name?: string;
  description?: string;

}
