import { IsNotEmpty } from 'class-validator';

export class CreateTeamDto {

	organizationId: string;
  name: string;
  description: string;
  roles: string[];

}
