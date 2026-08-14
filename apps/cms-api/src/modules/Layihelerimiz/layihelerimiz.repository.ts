import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLayihelerimizDto } from './dto/create-layihelerimiz.dto';
import { UpdateLayihelerimizDto } from './dto/update-layihelerimiz.dto';

@Injectable()
export class LayihelerimizRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.layihelerimizCategory.findMany({
      orderBy: { order: 'asc' },
    });
  }

  findVisible() {
    return this.prisma.layihelerimizCategory.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.layihelerimizCategory.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.layihelerimizCategory.findUnique({ where: { slug } });
  }

  create(data: CreateLayihelerimizDto & { slug: string }) {
    return this.prisma.layihelerimizCategory.create({ data });
  }

  update(id: string, data: UpdateLayihelerimizDto) {
    return this.prisma.layihelerimizCategory.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.layihelerimizCategory.delete({ where: { id } });
  }

  /** Verilən id sırasını order sütununa yazır (master-dəki reorder ilə eyni). */
  reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.layihelerimizCategory.update({
        where: { id },
        data: { order: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
