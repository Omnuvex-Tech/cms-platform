import { Injectable, NotFoundException } from '@nestjs/common';
import { VacancyRepository } from './vacancy.repository';
import { CreateVacancyCategoryDto } from './dto/create-vacancy-category.dto';
import { UpdateVacancyCategoryDto } from './dto/update-vacancy-category.dto';
import { ReorderVacancyCategoryDto } from './dto/reorder-vacancy-category.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ReorderVacancyDto } from './dto/reorder-vacancy.dto';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';
import { MailService } from '../mail/mail.service';
import { CreateVacancySubmissionDto } from './dto/create-vacancy-submission.dto';
import { generateVacancySchema } from './vacancy-schema-generator';


@Injectable()
export class VacancyService {
  constructor(private readonly repo: VacancyRepository,
    private readonly mailService: MailService,
  ) { }

  // ─── Category ────────────────────────────────────────────
  getAllCategories() { return this.repo.findAllCategories(); }

  async getCategoryById(id: number) {
    const cat = await this.repo.findCategoryById(id);
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  createCategory(dto: CreateVacancyCategoryDto) {
    return this.repo.createCategory(dto);
  }

  async updateCategory(id: number, dto: UpdateVacancyCategoryDto) {
    await this.getCategoryById(id);
    return this.repo.updateCategory(id, dto);
  }

  async deleteCategory(id: number) {
    await this.getCategoryById(id);
    return this.repo.deleteCategory(id);
  }

  reorderCategories(dto: ReorderVacancyCategoryDto) {
    return this.repo.reorderCategories(dto);
  }

  // ─── Vacancy ─────────────────────────────────────────────
  getAllVacancies() { return this.repo.findAllVacancies(); }

  async getVacancyById(id: number) {
    const v = await this.repo.findVacancyById(id);
    if (!v) throw new NotFoundException('Vacancy not found');
    return v;
  }

  createVacancy(dto: CreateVacancyDto) {
    return this.repo.createVacancy(dto);
  }

  async updateVacancy(id: number, dto: UpdateVacancyDto) {
    await this.getVacancyById(id);
    return this.repo.updateVacancy(id, dto);
  }

  async deleteVacancy(id: number) {
    await this.getVacancyById(id);
    return this.repo.deleteVacancy(id);
  }

  async toggleVisibility(id: number, isVisible: boolean) {
    await this.getVacancyById(id);
    return this.repo.toggleVisibility(id, isVisible);
  }

  async toggleNew(id: number, isNew: boolean) {
    await this.getVacancyById(id);
    return this.repo.toggleNew(id, isNew);
  }

  reorderVacancies(dto: ReorderVacancyDto) {
    return this.repo.reorderVacancies(dto);
  }

  async getVacancyBySlug(slug: string) {
    const v = await this.repo.findVacancyBySlug(slug);
    if (!v) throw new NotFoundException('Vacancy not found');
    return v;
  }

  // vacancy.service.ts — MailService inject et, bunları əlavə et

  async getSettings() {
    const s = await this.repo.getSettings();
    if (s) return s;
    return this.repo.createSettings();
  }

  async updateSettings(dto: UpdateVacancySettingsDto) {
    const s = await this.repo.getSettings();
    if (!s) {
      const created = await this.repo.createSettings();
      return this.repo.updateSettings(created.id, dto);
    }
    return this.repo.updateSettings(s.id, dto);
  }

  async createSubmission(dto: CreateVacancySubmissionDto) {
    const submission = await this.repo.createSubmission(dto);
    try {
      await this.mailService.sendVacancySubmission({
        ...dto,
        submittedAt: submission.createdAt,
      });
    } catch {
    }
    return submission;
  }

  async findAllSubmissions() {
    return this.repo.findAllSubmissions();
  }

  async generateSchema(id: number) {
    const vacancy = await this.getVacancyById(id);
    const baseUrl = process.env.SITE_URL!;
    return generateVacancySchema(vacancy, baseUrl);
  }

  async saveSchema(id: number, schema: Record<string, any> | null) {
    await this.getVacancyById(id);
    return this.repo.saveSchema(id, schema);
  }

  // ─── Filter Tags ──────────────────────────────────────
  getAllFilterTags() { return this.repo.findAllFilterTags(); }

  async getFilterTagById(id: number) {
    const ft = await this.repo.findFilterTagById(id);
    if (!ft) throw new NotFoundException('Filter tag not found');
    return ft;
  }

  createFilterTag(label: Record<string, string>) {
    return this.repo.createFilterTag(label);
  }

async updateFilterTag(id: number, label: Record<string, string>) {
    await this.getFilterTagById(id);
    return this.repo.updateFilterTag(id, label);
  }

  async toggleFilterTagActive(id: number, isActive: boolean) {
    await this.getFilterTagById(id);
    return this.repo.toggleFilterTagActive(id, isActive);
  }
  
  async deleteFilterTag(id: number) {
    await this.getFilterTagById(id);
    return this.repo.deleteFilterTag(id);
  }

  reorderFilterTags(items: { id: number; order: number }[]) {
    return this.repo.reorderFilterTags(items);
  }
}