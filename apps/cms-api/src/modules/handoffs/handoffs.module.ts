import { Module } from '@nestjs/common';
import { HandoffsController } from './handoffs.controller';
import { HandoffsService } from './handoffs.service';
import { HandoffsRepository } from './handoffs.repository';
import { ConversationsModule } from '../conversations/conversations.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  // For BotControlService: this page's Accept / Pause / Resume / Return-to-bot
  // controls have to reach the bot, not just the DB row. For TelegramAlerts:
  // accepting or resolving here has to update the group's alert, or someone
  // there would tap Accept on work already under way.
  imports: [ConversationsModule, TelegramModule],
  controllers: [HandoffsController],
  providers: [HandoffsService, HandoffsRepository],
})
export class HandoffsModule {}
