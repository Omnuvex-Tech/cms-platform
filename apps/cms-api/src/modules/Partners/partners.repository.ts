import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerSectionDto } from './dto/create-partner-section.dto';
import { UpdatePartnerSectionDto } from './dto/update-partner-section.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSection() {
    return this.prisma.partnerSection.findFirst({
      include: { partners: { orderBy: { order: 'asc' } } },
    });
  }

  findHomepage() {
    return this.prisma.partner.findMany({
      where: { isHomepage: true },
      orderBy: { order: 'asc' },
    });
  }

  createSection(dto: CreatePartnerSectionDto) {
    return this.prisma.partnerSection.create({ data: dto });
  }

  updateSection(id: number, dto: UpdatePartnerSectionDto) {
    return this.prisma.partnerSection.update({ where: { id }, data: dto });
  }

  findOnePartner(id: number) {
    return this.prisma.partner.findUnique({ where: { id } });
  }

  createPartner(dto: CreatePartnerDto) {
    return this.prisma.partner.create({ data: dto });
  }

  updatePartner(id: number, dto: UpdatePartnerDto) {
    return this.prisma.partner.update({ where: { id }, data: dto });
  }

  deletePartner(id: number) {
    return this.prisma.partner.delete({ where: { id } });
  }

  toggleHomepage(id: number, isHomepage: boolean) {
    return this.prisma.partner.update({ where: { id }, data: { isHomepage } });
  }

  async reorder(ids: number[]) {
    const updates = ids.map((id, index) =>
      this.prisma.partner.update({ where: { id }, data: { order: index } })
    );
    return this.prisma.$transaction(updates);
  }

  toggleVisibility(id: number, isVisible: boolean) {
  return this.prisma.partner.update({ where: { id }, data: { isVisible } });
}
}