import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramApiService } from './telegram-api.service';
import { TelegramAlertsService } from './telegram-alerts.service';
import { TelegramPollerService } from './telegram-poller.service';
import { TelegramRepository } from './telegram.repository';

/**
 * Escalation alerts in the Telegram ops group.
 *
 * Depends on nothing but Prisma on purpose: Ingest, Handoffs and Conversations
 * all import this module to announce their state changes, so any dependency of
 * its own on those modules would close a cycle. The Accept tap therefore writes
 * the handoff through this module's own repository rather than HandoffsService.
 */
@Module({
  controllers: [TelegramController],
  providers: [
    TelegramApiService,
    TelegramAlertsService,
    TelegramPollerService,
    TelegramRepository,
  ],
  exports: [TelegramAlertsService],
})
export class TelegramModule {}
