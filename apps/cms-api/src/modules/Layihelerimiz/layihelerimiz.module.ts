import { Module } from '@nestjs/common';
import { LayihelerimizController } from './layihelerimiz.controller';
import { LayihelerimizService } from './layihelerimiz.service';
import { LayihelerimizRepository } from './layihelerimiz.repository';
import { ProjectDetailController } from './project-detail.controller';
import { ProjectDetailService } from './project-detail.service';
import { ProjectDetailRepository } from './project-detail.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LayihelerimizController, ProjectDetailController],
  providers: [
    LayihelerimizService, LayihelerimizRepository,
    ProjectDetailService, ProjectDetailRepository,
    PrismaService,
  ],
})
export class LayihelerimizModule {}
