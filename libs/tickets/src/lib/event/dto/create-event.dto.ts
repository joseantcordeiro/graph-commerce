import { EventType } from "../../enum/event-type.enum";
import { PriceModel } from "../../enum/price-model.enum";

export class CreateEventDto {

	organizationId: string;
	name: string;
  displayName: string;
	description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  latitude: number;
  longitude: number;
  type: EventType = EventType.ONLINE;
  logo: string;
  cover: string;
  priceModel: PriceModel = PriceModel.FEE;
  price = 0.00;
  currency: string;
  taxes = 0.00;
  operationFee = 0.00;
  acceptablePayments: string[] = [];
  categories: string[] = [];
  tags: string[] = [];

}
