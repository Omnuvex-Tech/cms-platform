import { Module } from '@nestjs/common';
import { BotSyncService } from './bot-sync.service';

@Module({
  providers: [BotSyncService],
  exports: [BotSyncService],
})
export class BotSyncModule {}
