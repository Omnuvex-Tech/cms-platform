import { Module } from '@nestjs/common';
import { HeroController } from './hero.controller';
import { HeroService } from './hero.service';
import { HeroRepository } from './hero.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HeroController],
  providers: [HeroService, HeroRepository, PrismaService],
})
export class HeroModule {}