import { Module } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsRepository } from './testimonials.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TestimonialsController],
  providers: [TestimonialsService, TestimonialsRepository, PrismaService],
})
export class TestimonialsModule {}