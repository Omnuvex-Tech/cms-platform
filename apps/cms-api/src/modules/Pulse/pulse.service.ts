import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PulseRepository } from './pulse.repository';
import { CreatePulseArticleDto } from './dto/create-pulse-article.dto';
import { UpdatePulseArticleDto } from './dto/update-pulse-article.dto';
import { CreatePulseAuthorDto } from './dto/create-pulse-author.dto';
import { UpdatePulseAuthorDto } from './dto/update-pulse-author.dto';
import { CreatePulseKeywordDto } from './dto/create-pulse-keyword.dto';
import { UpdatePulseKeywordDto } from './dto/update-pulse-keyword.dto';
import { CreatePulseCategoryDto } from './dto/create-pulse-category.dto';
import { UpdatePulseCategoryDto } from './dto/update-pulse-category.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class PulseService {
  constructor(private readonly repo: PulseRepository) { }

  // ── Articles ──────────────────────────────────────────
  findAllArticles() {
    return this.repo.findAllArticles();
  }

  async findPublishedArticles(q?: string, categorySlug?: string) {
    let articles = await this.repo.findPublishedArticles();

    // Cross-language search: filter by title, excerpt, category in all languages (az, en, ru)
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      articles = articles.filter((a: any) => {
        const titleStr = typeof a.title === 'object' && a.title !== null
          ? Object.values(a.title).join(' ')
          : String(a.title || '');
        const excerptStr = typeof a.excerpt === 'object' && a.excerpt !== null
          ? Object.values(a.excerpt).join(' ')
          : String(a.excerpt || '');
        const categoryStr = typeof a.category === 'object' && a.category !== null
          ? Object.values(a.category).join(' ')
          : String(a.category || '');
        return (
          titleStr.toLowerCase().includes(term) ||
          excerptStr.toLowerCase().includes(term) ||
          categoryStr.toLowerCase().includes(term)
        );
      });
    }

    // Category filter: match by slug (az/en/ru values)
    if (categorySlug && categorySlug.trim()) {
      const slug = categorySlug.trim().toLowerCase();
      articles = articles.filter((a: any) => {
        if (!a.category || typeof a.category !== 'object') return false;
        const cat = a.category as Record<string, string>;
        return Object.values(cat).some(v =>
          String(v || '').toLowerCase().includes(slug)
        );
      });
    }

    return articles;
  }

  findArticleById(id: string) {
    return this.repo.findArticleById(id);
  }

  findArticleBySlug(slug: string) {
    return this.repo.findArticleBySlug(slug);
  }

  findHeaderArticles(position: string) {
    return this.repo.findHeaderArticles(position);
  }

  findFeaturedArticles() {
    return this.repo.findFeaturedArticles();
  }

  async createArticle(dto: CreatePulseArticleDto) {
    if (dto.slug) {
      const existing = await this.repo.findArticleBySlug(dto.slug);
      if (existing) throw new ConflictException('Bu artıq istifadə olunur');
    }
    const titleObj = dto.title as any;
    const titleText = typeof titleObj === 'object' && titleObj !== null ? (titleObj.az || Object.values(titleObj)[0] || '') : titleObj;
    return this.repo.createArticle({
      ...dto,
      slug: dto.slug || slugify(titleText),
    });
  }

  async updateArticle(id: string, dto: UpdatePulseArticleDto) {
    const existing = await this.repo.findArticleById(id);
    if (!existing) throw new NotFoundException('Məqalə tapılmadı');

    if (dto.slug) {
      const duplicate = await this.repo.findArticleBySlug(dto.slug);
      if (duplicate && duplicate.id !== id) throw new ConflictException('Bu slug artıq istifadə olunur');
    }

    return this.repo.updateArticle(id, dto);
  }

  async deleteArticle(id: string) {
    const existing = await this.repo.findArticleById(id);
    if (!existing) throw new NotFoundException('Məqalə tapılmadı');
    return this.repo.deleteArticle(id);
  }

  // ── Authors ──────────────────────────────────────────
  findAllAuthors() {
    return this.repo.findAllAuthors();
  }

  findAuthorById(id: string) {
    return this.repo.findAuthorById(id);
  }

  findAuthorBySlug(slug: string) {
    return this.repo.findAuthorBySlug(slug);
  }

  async createAuthor(dto: CreatePulseAuthorDto) {
    if (dto.slug) {
      const existing = await this.repo.findAuthorBySlug(dto.slug);
      if (existing) throw new ConflictException('Bu author artıq istifadə olunur');
    }
    return this.repo.createAuthor({
      ...dto,
      slug: dto.slug || slugify(dto.name),
    });
  }

  async updateAuthor(id: string, dto: UpdatePulseAuthorDto) {
    const existing = await this.repo.findAuthorById(id);
    if (!existing) throw new NotFoundException('Müəllif tapılmadı');
    return this.repo.updateAuthor(id, dto);
  }

  async deleteAuthor(id: string) {
    const existing = await this.repo.findAuthorById(id);
    if (!existing) throw new NotFoundException('Müəllif tapılmadı');
    return this.repo.deleteAuthor(id);
  }

  // ── Keywords ──────────────────────────────────────────
  findAllKeywords() {
    return this.repo.findAllKeywords();
  }

  findKeywordById(id: string) {
    return this.repo.findKeywordById(id);
  }

  findKeywordBySlug(slug: string) {
    return this.repo.findKeywordBySlug(slug);
  }

  async createKeyword(dto: CreatePulseKeywordDto) {
    if (dto.slug) {
      const existing = await this.repo.findKeywordBySlug(dto.slug);
      if (existing) throw new ConflictException('Bu keyword artıq istifadə olunur');
    }
    return this.repo.createKeyword({
      ...dto,
      slug: dto.slug || slugify(dto.name),
    });
  }

  async updateKeyword(id: string, dto: UpdatePulseKeywordDto) {
    const existing = await this.repo.findKeywordById(id);
    if (!existing) throw new NotFoundException('Açar söz tapılmadı');
    return this.repo.updateKeyword(id, dto);
  }

  async deleteKeyword(id: string) {
    const existing = await this.repo.findKeywordById(id);
    if (!existing) throw new NotFoundException('Açar söz tapılmadı');
    return this.repo.deleteKeyword(id);
  }

  // ── Categories ──────────────────────────────────────────
  findAllCategories() {
    return this.repo.findAllCategories();
  }

  findCategoryById(id: string) {
    return this.repo.findCategoryById(id);
  }

  async createCategory(dto: CreatePulseCategoryDto) {
    const existing = await this.repo.findAllCategories();
    const newName = typeof dto.name === 'object' ? ((dto.name as any)?.az || Object.values(dto.name as any)[0] || '') : dto.name;
    const duplicate = existing.find((c) => {
      const cNameVal = c.name as any;
      const cName = typeof cNameVal === 'object' && cNameVal !== null ? (cNameVal.az || Object.values(cNameVal)[0] || '') : cNameVal;
      return cName?.toLowerCase?.() === newName.toLowerCase();
    });
    if (duplicate) throw new ConflictException('Bu kateqoriya artıq mövcuddur');
    return this.repo.createCategory({
      ...dto,
      slug: dto.slug || slugify(newName),
    });
  }

  async updateCategory(id: string, dto: UpdatePulseCategoryDto) {
    const existing = await this.repo.findCategoryById(id);
    if (!existing) throw new NotFoundException('Kateqoriya tapılmadı');
    return this.repo.updateCategory(id, dto);
  }

  async deleteCategory(id: string) {
    const existing = await this.repo.findCategoryById(id);
    if (!existing) throw new NotFoundException('Kateqoriya tapılmadı');
    return this.repo.deleteCategory(id);
  }
}
