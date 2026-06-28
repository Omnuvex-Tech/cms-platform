import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDetailDto } from './dto/create-project-detail.dto';
import { UpdateProjectDetailDto } from './dto/update-project-detail.dto';

@Injectable()
export class ProjectDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.layihelerimizProjectDetail.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.layihelerimizProjectDetail.findUnique({
      where: { categorySlug: slug },
    });
  }

  findById(id: string) {
    return this.prisma.layihelerimizProjectDetail.findUnique({
      where: { id },
    });
  }

  create(data: CreateProjectDetailDto) {
    return this.prisma.layihelerimizProjectDetail.create({ data });
  }

  update(id: string, data: UpdateProjectDetailDto) {
    return this.prisma.layihelerimizProjectDetail.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.layihelerimizProjectDetail.delete({ where: { id } });
  }
}
