import { Module } from '@nestjs/common';
import { TrevaInfoController } from './treva-info.controller';
import { TrevaInfoService } from './treva-info.service';
import { BotSyncModule } from '../bot-sync/bot-sync.module';

@Module({
  imports: [BotSyncModule],
  controllers: [TrevaInfoController],
  providers: [TrevaInfoService],
})
export class TrevaInfoModule {}
