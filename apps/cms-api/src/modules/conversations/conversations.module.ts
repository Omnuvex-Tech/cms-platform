import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './conversations.repository';
import { BotControlService } from './bot-control.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository, BotControlService],
  exports: [ConversationsRepository],
})
export class ConversationsModule {}
