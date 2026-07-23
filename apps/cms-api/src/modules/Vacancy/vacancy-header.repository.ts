import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateVacancyHeaderDto } from './dto/update-vacancy-header.dto';

@Injectable()
export class VacancyHeaderRepository {
  constructor(private readonly prisma: PrismaService) {}

  findHeader() {
    return this.prisma.vacancyPageHeader.findFirst();
  }

  async upsertHeader(dto: UpdateVacancyHeaderDto) {
    const existing = await this.prisma.vacancyPageHeader.findFirst();
    if (existing) {
      return this.prisma.vacancyPageHeader.update({
        where: { id: existing.id },
        data: dto,
      });
    }
    return this.prisma.vacancyPageHeader.create({ data: dto });
  }
}