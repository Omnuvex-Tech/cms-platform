import { Controller, Post } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { TelegramAlertsService } from './telegram-alerts.service';

/**
 * Setup surface only. Getting the group's chat id right is the fiddly part of
 * wiring this up, so an admin can prove the token + chat id reach the group
 * without waiting for a real escalation.
 */
@Roles('admin')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly alerts: TelegramAlertsService) {}

  @Post('test')
  test() {
    return this.alerts.selfTest();
  }
}
