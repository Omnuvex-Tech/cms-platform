import { Module } from '@nestjs/common';
import { HandoffsController } from './handoffs.controller';
import { HandoffsService } from './handoffs.service';
import { HandoffsRepository } from './handoffs.repository';

@Module({
  controllers: [HandoffsController],
  providers: [HandoffsService, HandoffsRepository],
})
export class HandoffsModule {}
