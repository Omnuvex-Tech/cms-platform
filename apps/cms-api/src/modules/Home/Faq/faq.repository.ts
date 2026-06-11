import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.faq.findMany({ orderBy: { order: 'asc' } });
  }

  findAllVisible() {
    return this.prisma.faq.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.faq.findUnique({ where: { id } });
  }

  create(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  update(id: number, dto: UpdateFaqDto) {
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  toggleVisibility(id: number, isVisible: boolean) {
    return this.prisma.faq.update({ where: { id }, data: { isVisible } });
  }

  delete(id: number) {
    return this.prisma.faq.delete({ where: { id } });
  }

  async reorder(ids: number[]) {
    const updates = ids.map((id, index) =>
      this.prisma.faq.update({
        where: { id },
        data: { order: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}