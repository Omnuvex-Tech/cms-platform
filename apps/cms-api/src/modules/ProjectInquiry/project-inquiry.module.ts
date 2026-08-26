import { Module } from '@nestjs/common';
import { ProjectInquiryController } from './project-inquiry.controller';
import { ProjectInquiryService } from './project-inquiry.service';
import { ProjectInquiryRepository } from './project-inquiry.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { BitrixModule } from '../Bitrix/bitrix.module';

@Module({
  imports: [BitrixModule],
  controllers: [ProjectInquiryController],
  providers: [ProjectInquiryService, ProjectInquiryRepository, PrismaService],
})
export class ProjectInquiryModule {}
