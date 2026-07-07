import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTrevaInfoDto } from './dto/treva-info.dto';

/**
 * TREVA Information is a single company-info record. We always operate on the
 * first row, creating an empty draft on first access if none exists.
 */
@Injectable()
export class TrevaInfoService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.trevaInfo.findFirst({
      orderBy: { id: 'asc' },
    });
    if (existing) return existing;
    return this.prisma.trevaInfo.create({ data: {} });
  }

  async update(dto: UpdateTrevaInfoDto) {
    const record = await this.get();
    return this.prisma.trevaInfo.update({
      where: { id: record.id },
      data: dto,
    });
  }
}
