import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { IngestRepository } from './ingest.repository';

@Module({
  controllers: [IngestController],
  providers: [IngestService, IngestRepository],
})
export class IngestModule {}
