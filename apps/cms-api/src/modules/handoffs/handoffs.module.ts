import { Module } from '@nestjs/common';
import { HandoffsController } from './handoffs.controller';
import { HandoffsService } from './handoffs.service';
import { HandoffsRepository } from './handoffs.repository';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  // For BotControlService: this page's Accept / Pause / Resume / Return-to-bot
  // controls have to reach the bot, not just the DB row.
  imports: [ConversationsModule],
  controllers: [HandoffsController],
  providers: [HandoffsService, HandoffsRepository],
})
export class HandoffsModule {}
