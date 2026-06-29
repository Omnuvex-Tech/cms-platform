import { Module } from '@nestjs/common';
import { CallbackController } from './callback.controller';
import { CallbackService } from './callback.service';
import { CallbackRepository } from './callback.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CallbackController],
  providers: [CallbackService, CallbackRepository, PrismaService],
})
export class CallbackModule {}
