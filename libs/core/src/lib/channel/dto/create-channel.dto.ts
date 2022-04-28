
export class CreateChannelDto {

	organizationId: string;
	name: string;
	active = true;
	currencyCode: string;
	defaultCountry: string;

}
