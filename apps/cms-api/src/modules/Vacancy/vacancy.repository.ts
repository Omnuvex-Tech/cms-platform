import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVacancyCategoryDto } from './dto/create-vacancy-category.dto';
import { UpdateVacancyCategoryDto } from './dto/update-vacancy-category.dto';
import { ReorderVacancyCategoryDto } from './dto/reorder-vacancy-category.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ReorderVacancyDto } from './dto/reorder-vacancy.dto';

@Injectable()
export class VacancyRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Category ────────────────────────────────────────────
  findAllCategories() {
    return this.prisma.vacancyCategory.findMany({
      orderBy: { order: 'asc' },
    });
  }

  findCategoryById(id: number) {
    return this.prisma.vacancyCategory.findUnique({ where: { id } });
  }

  createCategory(dto: CreateVacancyCategoryDto) {
    return this.prisma.vacancyCategory.create({ data: dto });
  }

  updateCategory(id: number, dto: UpdateVacancyCategoryDto) {
    return this.prisma.vacancyCategory.update({ where: { id }, data: dto });
  }

  deleteCategory(id: number) {
    return this.prisma.vacancyCategory.delete({ where: { id } });
  }

  async reorderCategories(dto: ReorderVacancyCategoryDto) {
    return this.prisma.$transaction(
      dto.items.map(({ id, order }) =>
        this.prisma.vacancyCategory.update({ where: { id }, data: { order } }),
      ),
    );
  }

  // ─── Vacancy ─────────────────────────────────────────────
  findAllVacancies() {
    return this.prisma.vacancy.findMany({
      orderBy: { order: 'asc' },
      include: { category: true },
    });
  }

  findVacancyById(id: number) {
    return this.prisma.vacancy.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  createVacancy(dto: CreateVacancyDto) {
    return this.prisma.vacancy.create({
      data: {
        ...dto,
startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,      },
      include: { category: true },
    });
  }

  updateVacancy(id: number, dto: UpdateVacancyDto) {
    return this.prisma.vacancy.update({
      where: { id },
      data: {
        ...dto,
startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,      },
      include: { category: true },
    });
  }

  deleteVacancy(id: number) {
    return this.prisma.vacancy.delete({ where: { id } });
  }

  toggleVisibility(id: number, isVisible: boolean) {
    return this.prisma.vacancy.update({ where: { id }, data: { isVisible } });
  }

  toggleNew(id: number, isNew: boolean) {
    return this.prisma.vacancy.update({ where: { id }, data: { isNew } });
  }

  async reorderVacancies(dto: ReorderVacancyDto) {
    return this.prisma.$transaction(
      dto.items.map(({ id, order }) =>
        this.prisma.vacancy.update({ where: { id }, data: { order } }),
      ),
    );
  }

  findVacancyBySlug(slug: string) {
  return this.prisma.vacancy.findUnique({
    where: { slug },
    include: { category: true },
  });
}
}