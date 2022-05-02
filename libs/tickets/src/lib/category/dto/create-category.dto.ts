import { AllocationStrategy } from '../../enum/allocation-strategy.enum';
import { BadgeColor } from '../../enum/badge-color.enum';
import { CheckInStrategy } from '../../enum/checkin-strategy.enum';
import { ValidityType } from '../../enum/validity.enum';
import { Visibility } from '../../enum/visibility.enum';

export class CreateCategoryDto {

	organizationId: string;
	name: string;
	description: string;
  categoryCode: string;
  visibility: Visibility = Visibility.PUBLIC;
  allocationStrategy: AllocationStrategy = AllocationStrategy.FIXED;
  maxTickets?: number;
  onSaleFrom: Date;
  onSaleUntil: Date;
  price: number;
  checkInStrategy: CheckInStrategy = CheckInStrategy.ANYTIME;
  checkInFrom?: Date;
  checkInUntil?: Date;
  validityType: ValidityType = ValidityType.ENTIRE;
  validityFrom?: Date;
  validityUntil?: Date;
  badgeColor: BadgeColor = BadgeColor.WHITE;

}
