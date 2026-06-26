import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeRepository } from './home.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HomeController],
  providers: [HomeService, HomeRepository, PrismaService],
})
export class HomeModule {}