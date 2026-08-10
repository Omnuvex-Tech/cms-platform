import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { IngestRepository } from './ingest.repository';
import { ConversationsModule } from '../conversations/conversations.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  // For BotControlService: an escalation pauses the bot, which has to reach the
  // bot itself and not just the DB row. For TelegramAlertsService: an escalation
  // is also announced in the ops group.
  imports: [ConversationsModule, TelegramModule],
  controllers: [IngestController],
  providers: [IngestService, IngestRepository],
})
export class IngestModule {}
