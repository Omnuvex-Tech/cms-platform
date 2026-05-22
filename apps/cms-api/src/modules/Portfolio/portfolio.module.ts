import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioRepository } from './portfolio.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioRepository, PrismaService],
})
export class PortfolioModule {}