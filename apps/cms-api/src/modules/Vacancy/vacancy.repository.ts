// vacancy.repository.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVacancyCategoryDto } from './dto/create-vacancy-category.dto';
import { UpdateVacancyCategoryDto } from './dto/update-vacancy-category.dto';
import { ReorderVacancyCategoryDto } from './dto/reorder-vacancy-category.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ReorderVacancyDto } from './dto/reorder-vacancy.dto';
import { CreateVacancySubmissionDto } from './dto/create-vacancy-submission.dto';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';
import { CreateVacancyFilterTagDto } from './dto/create-vacancy-filter-tag.dto';

@Injectable()
export class VacancyRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Category ─────────────────────────────────────────
  findAllCategories() {
    return this.prisma.vacancyCategory.findMany({ orderBy: { order: 'asc' } });
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

// ─── Vacancy ──────────────────────────────────────────
  findAllVacancies() {
    return this.prisma.vacancy.findMany({
      orderBy: { order: 'asc' },
      include: { category: true, filterTags: true },
    });
  }

  findVacancyById(id: number) {
    return this.prisma.vacancy.findUnique({
      where: { id },
      include: { category: true, filterTags: true },
    });
  }

  findVacancyBySlug(slug: string) {
    return this.prisma.vacancy.findUnique({
      where: { slug },
      include: { category: true, filterTags: true },
    });
  }
async createVacancy(dto: CreateVacancyDto) {
    try {
      const { schema, filterTagIds, ...rest } = dto;
      return await this.prisma.vacancy.create({
        data: {
          ...rest,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
          ...(schema !== undefined && {
            schema: schema === null ? Prisma.JsonNull : schema,
          }),
          ...(filterTagIds && filterTagIds.length > 0 && {
            filterTags: { connect: filterTagIds.map((id) => ({ id })) },
          }),
        },
        include: { category: true, filterTags: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Bu slug artıq mövcuddur, başqa slug yazın');
      }
      throw err;
    }
  }

async updateVacancy(id: number, dto: UpdateVacancyDto) {
    try {
      const { schema, filterTagIds, ...rest } = dto;
      return await this.prisma.vacancy.update({
        where: { id },
        data: {
          ...rest,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
          ...(schema !== undefined && {
            schema: schema === null ? Prisma.JsonNull : schema,
          }),
          ...(filterTagIds !== undefined && {
            filterTags: { set: filterTagIds.map((id) => ({ id })) },
          }),
        },
        include: { category: true, filterTags: true },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Bu slug artıq mövcuddur, başqa slug seçin');
      }
      throw err;
    }
  }

  saveSchema(id: number, schema: Record<string, any> | null) {
    return this.prisma.vacancy.update({
      where: { id },
      data: { schema: schema === null ? Prisma.JsonNull : schema },
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

  // ─── Settings ─────────────────────────────────────────
  async getSettings() {
    return this.prisma.vacancySettings.findFirst();
  }

  async createSettings() {
    return this.prisma.vacancySettings.create({ data: {} });
  }

  async updateSettings(id: number, dto: UpdateVacancySettingsDto) {
    return this.prisma.vacancySettings.update({
      where: { id },
      data: dto,
    });
  }

  // ─── Submissions ──────────────────────────────────────
  async createSubmission(dto: CreateVacancySubmissionDto) {
    return this.prisma.vacancySubmission.create({ data: dto });
  }

  async findAllSubmissions() {
    return this.prisma.vacancySubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }


  // ─── Filter Tags ──────────────────────────────────────
  findAllFilterTags() {
    return this.prisma.vacancyFilterTag.findMany({ orderBy: { order: 'asc' } });
  }

  findFilterTagById(id: number) {
    return this.prisma.vacancyFilterTag.findUnique({ where: { id } });
  }

async createFilterTag(label: Record<string, string>) {
    const count = await this.prisma.vacancyFilterTag.count();
    return this.prisma.vacancyFilterTag.create({ data: { label, order: count } });
  }

updateFilterTag(id: number, label: Record<string, string>) {
    return this.prisma.vacancyFilterTag.update({ where: { id }, data: { label } });
  }

  async toggleFilterTagActive(id: number, isActive: boolean) {
    if (isActive) {
      const activeCount = await this.prisma.vacancyFilterTag.count({ where: { isActive: true } });
      if (activeCount >= 7) {
        throw new ConflictException('Saytda eyni anda maksimum 7 tag aktiv ola bilər');
      }
    }
    return this.prisma.vacancyFilterTag.update({ where: { id }, data: { isActive } });
  }

  deleteFilterTag(id: number) {
    return this.prisma.vacancyFilterTag.delete({ where: { id } });
  }

  async reorderFilterTags(items: { id: number; order: number }[]) {
    return this.prisma.$transaction(
      items.map(({ id, order }) =>
        this.prisma.vacancyFilterTag.update({ where: { id }, data: { order } }),
      ),
    );
  }
}