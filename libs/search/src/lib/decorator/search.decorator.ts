import { Inject } from '@nestjs/common';
import { MEILI_CLIENT } from '../config/search.config';

export function InjectMeiliSearch() {
  return Inject(MEILI_CLIENT);
}
