import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';
import { Session } from './decorator/session.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

  @Get('sessioninfo')
  @UseGuards(AuthGuard)
  getSessionInfo(@Session() session: SessionContainer): any {
    return this.authService.getSessionInfo(session);
  }
}
