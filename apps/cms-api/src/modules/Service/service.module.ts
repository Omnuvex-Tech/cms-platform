import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { ServiceRepository } from './service.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, ServiceRepository, PrismaService],
})
export class ServiceModule {}