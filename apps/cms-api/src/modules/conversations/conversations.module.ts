import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { BotControlService } from './bot-control.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  // For TelegramAlertsService: resuming the bot here ends the handoff, which has
  // to close the ops group's alert too. TelegramModule depends on nothing but
  // Prisma, so this import cannot close a cycle.
  imports: [TelegramModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository, BotControlService],
  // BotControlService is exported because every panel->bot pause/resume must go
  // through it: writing Conversation.botActive straight to the DB from another
  // module leaves the bot talking while the UI claims it is paused.
  exports: [ConversationsRepository, BotControlService],
})
export class ConversationsModule {}
