import { Module } from '@nestjs/common';
import { ResaleInquiryController } from './resale-inquiry.controller';
import { ResaleInquiryService } from './resale-inquiry.service';
import { ResaleInquiryRepository } from './resale-inquiry.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { BitrixModule } from '../Bitrix/bitrix.module';

@Module({
  imports: [BitrixModule],
  controllers: [ResaleInquiryController],
  providers: [ResaleInquiryService, ResaleInquiryRepository, PrismaService],
})
export class ResaleInquiryModule {}
