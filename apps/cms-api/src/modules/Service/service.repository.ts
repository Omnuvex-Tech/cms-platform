import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({ orderBy: { order: 'asc' } });
  }

  findAllVisible() {
    return this.prisma.service.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.service.findUnique({ where: { slug } });
  }

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        ...dto,
        features: dto.features ?? [],
        sections: dto.sections ?? [],
      },
    });
  }

  update(id: number, dto: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  toggleVisibility(id: number, isVisible: boolean) {
    return this.prisma.service.update({ where: { id }, data: { isVisible } });
  }

  delete(id: number) {
    return this.prisma.service.delete({ where: { id } });
  }

  async reorder(ids: number[]) {
    const updates = ids.map((id, index) =>
      this.prisma.service.update({ where: { id }, data: { order: index } })
    );
    return this.prisma.$transaction(updates);
  }
}