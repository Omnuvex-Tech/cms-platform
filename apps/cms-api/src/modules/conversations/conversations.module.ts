import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { BotControlService } from './bot-control.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository, BotControlService],
  // BotControlService is exported because every panel->bot pause/resume must go
  // through it: writing Conversation.botActive straight to the DB from another
  // module leaves the bot talking while the UI claims it is paused.
  exports: [ConversationsRepository, BotControlService],
})
export class ConversationsModule {}
