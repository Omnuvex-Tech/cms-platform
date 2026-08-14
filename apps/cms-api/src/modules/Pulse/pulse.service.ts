import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PulseRepository } from './pulse.repository';
import { CreatePulseArticleDto } from './dto/create-pulse-article.dto';
import { UpdatePulseArticleDto } from './dto/update-pulse-article.dto';
import { generatePulseArticleSchema } from './pulse-schema-generator';
import { CreatePulseAuthorDto } from './dto/create-pulse-author.dto';
import { UpdatePulseAuthorDto } from './dto/update-pulse-author.dto';
import { CreatePulseKeywordDto } from './dto/create-pulse-keyword.dto';
import { UpdatePulseKeywordDto } from './dto/update-pulse-keyword.dto';
import { CreatePulseCategoryDto } from './dto/create-pulse-category.dto';
import { UpdatePulseCategoryDto } from './dto/update-pulse-category.dto';

const PULSE_UPLOAD_PREFIX = '/uploads/pulse/';
type LocalizedText = string | { az?: string; en?: string; ru?: string } | null | undefined;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizePulseAvatar(avatar?: string | null): string | undefined {
  if (!avatar) return undefined;
  return avatar.startsWith(PULSE_UPLOAD_PREFIX) ? avatar : undefined;
}

function sanitizeAuthorEntity<T extends { avatar?: string | null } | null>(author: T): T {
  if (!author) return author;
  return {
    ...author,
    avatar: sanitizePulseAvatar(author.avatar),
  } as T;
}

function sanitizeArticleEntity<T extends { author?: any; selectedArticles?: any[] } | null>(article: T): T {
  if (!article) return article;
  return {
    ...article,
    author: sanitizeAuthorEntity(article.author),
    selectedArticles: Array.isArray(article.selectedArticles)
      ? article.selectedArticles.map((selectedArticle) => sanitizeArticleEntity(selectedArticle))
      : article.selectedArticles,
  } as T;
}

function getPrimaryLocalizedValue(value: LocalizedText): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();

  const normalizedEntries = [value.az, value.en, value.ru, ...Object.values(value)]
    .map((entry) => String(entry ?? '').trim())
    .filter(Boolean);

  return normalizedEntries[0] || '';
}

function normalizeLocalizedText(value: LocalizedText): { az: string; en: string; ru: string } {
  const fallback = getPrimaryLocalizedValue(value);

  if (typeof value === 'string' || !value) {
    return { az: fallback, en: fallback, ru: fallback };
  }

  const az = String(value.az ?? '').trim() || fallback;
  const en = String(value.en ?? '').trim() || az || fallback;
  const ru = String(value.ru ?? '').trim() || az || fallback;

  return { az, en, ru };
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

    return articles.map((article: any) => sanitizeArticleEntity(article));
  }

  async findArticleById(id: string) {
    const article = await this.repo.findArticleById(id);
    return sanitizeArticleEntity(article);
  }

  async findArticleBySlug(slug: string) {
    const article = await this.repo.findArticleBySlug(slug);
    return sanitizeArticleEntity(article);
  }

  async findHeaderArticles(position: string) {
    const articles = await this.repo.findHeaderArticles(position);
    return articles.map((article: any) => sanitizeArticleEntity(article));
  }

  async findFeaturedArticles() {
    const articles = await this.repo.findFeaturedArticles();
    return articles.map((article: any) => sanitizeArticleEntity(article));
  }

  async createArticle(dto: CreatePulseArticleDto) {
    if (dto.slug) {
      const existing = await this.repo.findArticleBySlug(dto.slug);
      if (existing) throw new ConflictException('Bu artıq istifadə olunur');
    }
    const titleObj = dto.title as any;
    const titleText = typeof titleObj === 'object' && titleObj !== null ? (titleObj.az || Object.values(titleObj)[0] || '') : titleObj;
    const article = await this.repo.createArticle({
      ...dto,
      slug: dto.slug || slugify(titleText),
    });
    return sanitizeArticleEntity(article);
  }

  /** JSON-LD-ni yaradır, amma yazmır — CMS-də önizləmə üçün. */
  async generateArticleSchema(id: string) {
    const article = await this.findArticleById(id);
    const baseUrl = process.env.SITE_URL!;
    return generatePulseArticleSchema(article, baseUrl);
  }

  /** Admin təsdiqlədikdən sonra JSON-LD-ni saxlayır. */
  async saveArticleSchema(id: string, schema: Record<string, any> | null) {
    await this.findArticleById(id);
    return this.repo.updateArticle(id, { schema } as any);
  }

  async updateArticle(id: string, dto: UpdatePulseArticleDto) {
    const existing = await this.repo.findArticleById(id);
    if (!existing) throw new NotFoundException('Məqalə tapılmadı');

    if (dto.slug) {
      const duplicate = await this.repo.findArticleBySlug(dto.slug);
      if (duplicate && duplicate.id !== id) throw new ConflictException('Bu slug artıq istifadə olunur');
    }

    const article = await this.repo.updateArticle(id, dto);
    return sanitizeArticleEntity(article);
  }

  async deleteArticle(id: string) {
    const existing = await this.repo.findArticleById(id);
    if (!existing) throw new NotFoundException('Məqalə tapılmadı');
    return this.repo.deleteArticle(id);
  }

  // ── Authors ──────────────────────────────────────────
  async findAllAuthors() {
    const authors = await this.repo.findAllAuthors();
    return authors.map((author: any) => sanitizeAuthorEntity(author));
  }

  async findAuthorById(id: string) {
    const author = await this.repo.findAuthorById(id);
    return sanitizeAuthorEntity(author);
  }

  async findAuthorBySlug(slug: string) {
    const author = await this.repo.findAuthorBySlug(slug);
    return sanitizeAuthorEntity(author);
  }

  async createAuthor(dto: CreatePulseAuthorDto) {
    if (dto.slug) {
      const existing = await this.repo.findAuthorBySlug(dto.slug);
      if (existing) throw new ConflictException('Bu author artıq istifadə olunur');
    }
    const normalizedName = normalizeLocalizedText(dto.name);
    const normalizedTitle = dto.title !== undefined ? normalizeLocalizedText(dto.title) : undefined;
    const normalizedDescription = dto.description !== undefined ? normalizeLocalizedText(dto.description) : undefined;
    const author = await this.repo.createAuthor({
      ...dto,
      name: normalizedName,
      ...(normalizedTitle !== undefined && { title: normalizedTitle }),
      ...(normalizedDescription !== undefined && { description: normalizedDescription }),
      avatar: sanitizePulseAvatar(dto.avatar),
      slug: dto.slug || slugify(getPrimaryLocalizedValue(normalizedName)),
    });
    return sanitizeAuthorEntity(author);
  }

  async updateAuthor(id: string, dto: UpdatePulseAuthorDto) {
    const existing = await this.repo.findAuthorById(id);
    if (!existing) throw new NotFoundException('Müəllif tapılmadı');

    if (dto.slug) {
      const duplicate = await this.repo.findAuthorBySlug(dto.slug);
      if (duplicate && duplicate.id !== id) throw new ConflictException('Bu author artıq istifadə olunur');
    }

    const author = await this.repo.updateAuthor(id, {
      ...dto,
      ...(dto.name !== undefined && { name: normalizeLocalizedText(dto.name) }),
      ...(dto.title !== undefined && { title: normalizeLocalizedText(dto.title) }),
      ...(dto.description !== undefined && { description: normalizeLocalizedText(dto.description) }),
      ...(dto.avatar !== undefined && { avatar: sanitizePulseAvatar(dto.avatar) }),
    });
    return sanitizeAuthorEntity(author);
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
    const normalizedName = normalizeLocalizedText(dto.name);

    if (dto.slug) {
      const existing = await this.repo.findKeywordBySlug(dto.slug);
      if (existing) throw new ConflictException('Bu keyword artıq istifadə olunur');
    }

    return this.repo.createKeyword({
      ...dto,
      name: normalizedName,
      slug: dto.slug || slugify(getPrimaryLocalizedValue(normalizedName)),
    });
  }

  async updateKeyword(id: string, dto: UpdatePulseKeywordDto) {
    const existing = await this.repo.findKeywordById(id);
    if (!existing) throw new NotFoundException('Açar söz tapılmadı');

    if (dto.slug) {
      const duplicate = await this.repo.findKeywordBySlug(dto.slug);
      if (duplicate && duplicate.id !== id) throw new ConflictException('Bu keyword artıq istifadə olunur');
    }

    return this.repo.updateKeyword(id, {
      ...dto,
      ...(dto.name !== undefined && { name: normalizeLocalizedText(dto.name) }),
    });
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
    const normalizedName = normalizeLocalizedText(dto.name);
    const existing = await this.repo.findAllCategories();
    const newName = getPrimaryLocalizedValue(normalizedName);
    const duplicate = existing.find((c) => {
      const cNameVal = c.name as any;
      const cName = typeof cNameVal === 'object' && cNameVal !== null ? (cNameVal.az || Object.values(cNameVal)[0] || '') : cNameVal;
      return cName?.toLowerCase?.() === newName.toLowerCase();
    });
    if (duplicate) throw new ConflictException('Bu kateqoriya artıq mövcuddur');

    if (dto.slug) {
      const duplicateSlug = existing.find((category) => category.slug === dto.slug);
      if (duplicateSlug) throw new ConflictException('Bu slug artıq istifadə olunur');
    }

    return this.repo.createCategory({
      ...dto,
      name: normalizedName,
      slug: dto.slug || slugify(newName),
    });
  }

  async updateCategory(id: string, dto: UpdatePulseCategoryDto) {
    const existing = await this.repo.findCategoryById(id);
    if (!existing) throw new NotFoundException('Kateqoriya tapılmadı');

    const categories = await this.repo.findAllCategories();

    if (dto.slug) {
      const duplicateSlug = categories.find((category) => category.slug === dto.slug && category.id !== id);
      if (duplicateSlug) throw new ConflictException('Bu slug artıq istifadə olunur');
    }

    if (dto.name !== undefined) {
      const normalizedName = normalizeLocalizedText(dto.name);
      const newName = getPrimaryLocalizedValue(normalizedName);
      const duplicateName = categories.find((category) => {
        if (category.id === id) return false;
        const categoryName = getPrimaryLocalizedValue(category.name as LocalizedText);
        return categoryName.toLowerCase() === newName.toLowerCase();
      });

      if (duplicateName) throw new ConflictException('Bu kateqoriya artıq mövcuddur');

      return this.repo.updateCategory(id, {
        ...dto,
        name: normalizedName,
      });
    }

    return this.repo.updateCategory(id, dto);
  }

  async deleteCategory(id: string) {
    const existing = await this.repo.findCategoryById(id);
    if (!existing) throw new NotFoundException('Kateqoriya tapılmadı');
    return this.repo.deleteCategory(id);
  }
}
