import { Module } from '@nestjs/common';
import { LayihelerimizController } from './layihelerimiz.controller';
import { LayihelerimizService } from './layihelerimiz.service';
import { LayihelerimizRepository } from './layihelerimiz.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LayihelerimizController],
  providers: [LayihelerimizService, LayihelerimizRepository, PrismaService],
})
export class LayihelerimizModule {}
