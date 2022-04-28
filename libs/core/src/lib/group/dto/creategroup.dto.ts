import { GroupType } from '../enum/grouptype';
export class CreateGroupDto {

	organizationId: string;
	name: string;
	description: string;
	active = true;
	type: GroupType = GroupType.PERMISSION;

}
