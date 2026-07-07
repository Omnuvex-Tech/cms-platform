import { Module } from '@nestjs/common';
import { TrevaInfoController } from './treva-info.controller';
import { TrevaInfoService } from './treva-info.service';

@Module({
  controllers: [TrevaInfoController],
  providers: [TrevaInfoService],
})
export class TrevaInfoModule {}
