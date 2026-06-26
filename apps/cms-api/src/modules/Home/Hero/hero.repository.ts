import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateHeroDto } from './dto/update-hero.dto';

@Injectable()
export class HeroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let hero = await this.prisma.heroSettings.findFirst();
    if (!hero) {
      hero = await this.prisma.heroSettings.create({ data: {} });
    }
    return hero;
  }

  async update(dto: UpdateHeroDto) {
    const hero = await this.get();
    return this.prisma.heroSettings.update({
      where: { id: hero.id },
      data: dto,
    });
  }
}