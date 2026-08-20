import { Module } from '@nestjs/common';
import { BitrixService } from './bitrix.service';

@Module({
  providers: [BitrixService],
  exports: [BitrixService],
})
export class BitrixModule {}
