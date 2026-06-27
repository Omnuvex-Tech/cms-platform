import { Module } from '@nestjs/common';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';
import { PulseRepository } from './pulse.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PulseController],
  providers: [PulseService, PulseRepository, PrismaService],
})
export class PulseModule {}
