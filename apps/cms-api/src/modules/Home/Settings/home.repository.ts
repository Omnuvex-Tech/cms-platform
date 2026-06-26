import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateHomeDto } from './dto/update-home.dto';

@Injectable()
export class HomeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let home = await this.prisma.homeSettings.findFirst();
    if (!home) home = await this.prisma.homeSettings.create({ data: {} });
    return home;
  }

  async update(dto: UpdateHomeDto) {
    const home = await this.get();
    return this.prisma.homeSettings.update({
      where: { id: home.id },
      data: dto,
    });
  }
}