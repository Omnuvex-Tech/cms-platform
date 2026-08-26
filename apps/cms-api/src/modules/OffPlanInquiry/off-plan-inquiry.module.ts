import { Module } from '@nestjs/common';
import { OffPlanInquiryController } from './off-plan-inquiry.controller';
import { OffPlanInquiryService } from './off-plan-inquiry.service';
import { OffPlanInquiryRepository } from './off-plan-inquiry.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { BitrixModule } from '../Bitrix/bitrix.module';

@Module({
  imports: [BitrixModule],
  controllers: [OffPlanInquiryController],
  providers: [OffPlanInquiryService, OffPlanInquiryRepository, PrismaService],
})
export class OffPlanInquiryModule {}
