import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { FaqRepository } from './faq.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FaqController],
  providers: [FaqService, FaqRepository, PrismaService],
})
export class FaqModule {}