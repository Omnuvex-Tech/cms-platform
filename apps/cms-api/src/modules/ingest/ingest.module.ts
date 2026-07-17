import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { IngestRepository } from './ingest.repository';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  // For BotControlService: an escalation pauses the bot, which has to reach the
  // bot itself and not just the DB row.
  imports: [ConversationsModule],
  controllers: [IngestController],
  providers: [IngestService, IngestRepository],
})
export class IngestModule {}
