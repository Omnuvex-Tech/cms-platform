import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVacancyCategoryDto } from './dto/create-vacancy-category.dto';
import { UpdateVacancyCategoryDto } from './dto/update-vacancy-category.dto';
import { ReorderVacancyCategoryDto } from './dto/reorder-vacancy-category.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ReorderVacancyDto } from './dto/reorder-vacancy.dto';
import { CreateVacancySubmissionDto } from './dto/create-vacancy-submission.dto';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';

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

// VacancySettings
async getSettings() {
  return this.prisma.vacancySettings.findFirst();
}

async createSettings() {
  return this.prisma.vacancySettings.create({ data: {} });
}

async updateSettings(id: number, dto: UpdateVacancySettingsDto) {
  return this.prisma.vacancySettings.update({
    where: { id },
    data: {
      ...(dto.backLabel !== undefined && { backLabel: dto.backLabel }),
      ...(dto.applyTitle !== undefined && { applyTitle: dto.applyTitle }),
      ...(dto.aboutRoleLabel !== undefined && { aboutRoleLabel: dto.aboutRoleLabel }),
      ...(dto.skillsLabel !== undefined && { skillsLabel: dto.skillsLabel }),
      ...(dto.responsibleLabel !== undefined && { responsibleLabel: dto.responsibleLabel }),
      ...(dto.requirementsLabel !== undefined && { requirementsLabel: dto.requirementsLabel }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.emailHref !== undefined && { emailHref: dto.emailHref }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.phoneHref !== undefined && { phoneHref: dto.phoneHref }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.emailLabel !== undefined && { emailLabel: dto.emailLabel }),
      ...(dto.phoneLabel !== undefined && { phoneLabel: dto.phoneLabel }),
      ...(dto.locationLabel !== undefined && { locationLabel: dto.locationLabel }),
      ...(dto.formNameLabel !== undefined && { formNameLabel: dto.formNameLabel }),
      ...(dto.formNamePlaceholder !== undefined && { formNamePlaceholder: dto.formNamePlaceholder }),
      ...(dto.formEmailLabel !== undefined && { formEmailLabel: dto.formEmailLabel }),
      ...(dto.formEmailPlaceholder !== undefined && { formEmailPlaceholder: dto.formEmailPlaceholder }),
      ...(dto.formPhoneLabel !== undefined && { formPhoneLabel: dto.formPhoneLabel }),
      ...(dto.formPhonePlaceholder !== undefined && { formPhonePlaceholder: dto.formPhonePlaceholder }),
      ...(dto.formMessageLabel !== undefined && { formMessageLabel: dto.formMessageLabel }),
      ...(dto.formMessagePlaceholder !== undefined && { formMessagePlaceholder: dto.formMessagePlaceholder }),
      ...(dto.formCvLabel !== undefined && { formCvLabel: dto.formCvLabel }),
      ...(dto.formCvPlaceholder !== undefined && { formCvPlaceholder: dto.formCvPlaceholder }),
      ...(dto.formSubmitLabel !== undefined && { formSubmitLabel: dto.formSubmitLabel }),
    },
  });
}

// Submissions
async createSubmission(dto: CreateVacancySubmissionDto) {
  return this.prisma.vacancySubmission.create({ data: dto });
}

async findAllSubmissions() {
  return this.prisma.vacancySubmission.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
}