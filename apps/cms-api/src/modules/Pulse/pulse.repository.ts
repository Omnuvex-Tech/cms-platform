import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePulseArticleDto } from './dto/create-pulse-article.dto';
import { UpdatePulseArticleDto } from './dto/update-pulse-article.dto';
import { CreatePulseAuthorDto } from './dto/create-pulse-author.dto';
import { UpdatePulseAuthorDto } from './dto/update-pulse-author.dto';
import { CreatePulseKeywordDto } from './dto/create-pulse-keyword.dto';
import { UpdatePulseKeywordDto } from './dto/update-pulse-keyword.dto';
import { CreatePulseCategoryDto } from './dto/create-pulse-category.dto';
import { UpdatePulseCategoryDto } from './dto/update-pulse-category.dto';

@Injectable()
export class PulseRepository {
  constructor(private readonly prisma: PrismaService) { }

  // ── Articles ──────────────────────────────────────────
  findAllArticles() {
    return this.prisma.pulseArticle.findMany({
      include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublishedArticles(q?: string, categorySlug?: string) {
    // Always fetch all published articles — filtering done in service layer
    // because Prisma doesn't support mode:insensitive on JSON path filters
    return this.prisma.pulseArticle.findMany({
      where: { published: true },
      include: {
        author: true,
        keywords: true,
        selectedArticles: { include: { author: true, keywords: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  findArticleById(id: string) {
    return this.prisma.pulseArticle.findUnique({
      where: { id },
      include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
    });
  }

  findArticleBySlug(slug: string) {
    return this.prisma.pulseArticle.findUnique({
      where: { slug },
      include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
    });
  }

  findHeaderArticles(position: string) {
    return this.prisma.$queryRaw`
      SELECT * FROM "pulse_articles"
      WHERE published = true
      AND "headerPositions" @> ${JSON.stringify([position])}::jsonb
      ORDER BY "headerOrder" ASC
    `.then(async (articles: any[]) => {
      // Attach relations for each article
      const enriched = await Promise.all(articles.map(async (a: any) => {
        const full = await this.prisma.pulseArticle.findUnique({
          where: { id: a.id },
          include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
        });
        return full;
      }));
      return enriched.filter(Boolean);
    });
  }

  findFeaturedArticles() {
    return this.prisma.pulseArticle.findMany({
      where: { published: true, featured: true },
      include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
      orderBy: { date: 'desc' },
      take: 6,
    });
  }

  createArticle(dto: CreatePulseArticleDto & { slug: string }) {
    return this.prisma.pulseArticle.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
        coverImage: dto.coverImage,
        excerpt: dto.excerpt,
        authorId: dto.authorId,
        blocks: dto.blocks ?? [],
        socialLinks: (dto.socialLinks as any) ?? undefined,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        featured: dto.featured ?? false,
        published: dto.published ?? false,
        headerPositions: (dto.headerPositions as any) ?? [],
        headerOrder: dto.headerOrder,
        keywords: dto.keywordIds
          ? { connect: dto.keywordIds.map((id) => ({ id })) }
          : undefined,
        selectedArticles: dto.selectedArticleIds
          ? { connect: dto.selectedArticleIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
    });
  }

  updateArticle(id: string, dto: UpdatePulseArticleDto) {
    return this.prisma.pulseArticle.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.authorId !== undefined && { authorId: dto.authorId }),
        ...(dto.blocks !== undefined && { blocks: dto.blocks }),
        ...(dto.socialLinks !== undefined && { socialLinks: dto.socialLinks as any }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
        ...(dto.published !== undefined && { published: dto.published }),
        ...(dto.headerPositions !== undefined && { headerPositions: dto.headerPositions as any }),
        ...(dto.headerOrder !== undefined && { headerOrder: dto.headerOrder }),
        ...(dto.keywordIds !== undefined && {
          keywords: { set: dto.keywordIds.map((kid) => ({ id: kid })) },
        }),
        ...(dto.selectedArticleIds !== undefined && {
          selectedArticles: { set: dto.selectedArticleIds.map((sid) => ({ id: sid })) },
        }),
      },
      include: { author: true, keywords: true, selectedArticles: { include: { author: true, keywords: true } } },
    });
  }

  deleteArticle(id: string) {
    return this.prisma.pulseArticle.delete({ where: { id } });
  }

  // ── Authors ──────────────────────────────────────────
  findAllAuthors() {
    return this.prisma.pulseAuthor.findMany({ orderBy: { name: 'asc' } });
  }

  findAuthorById(id: string) {
    return this.prisma.pulseAuthor.findUnique({ where: { id } });
  }

  findAuthorBySlug(slug: string) {
    return this.prisma.pulseAuthor.findUnique({
      where: { slug },
      include: { articles: true },
    });
  }

  createAuthor(dto: CreatePulseAuthorDto & { slug: string }) {
    return this.prisma.pulseAuthor.create({ data: dto });
  }

  updateAuthor(id: string, dto: UpdatePulseAuthorDto) {
    return this.prisma.pulseAuthor.update({ where: { id }, data: dto });
  }

  deleteAuthor(id: string) {
    return this.prisma.pulseAuthor.delete({ where: { id } });
  }

  // ── Keywords ──────────────────────────────────────────
  findAllKeywords() {
    return this.prisma.pulseKeyword.findMany({ orderBy: { name: 'asc' } });
  }

  findKeywordById(id: string) {
    return this.prisma.pulseKeyword.findUnique({ where: { id } });
  }

  findKeywordBySlug(slug: string) {
    return this.prisma.pulseKeyword.findUnique({
      where: { slug },
      include: { articles: true },
    });
  }

  createKeyword(dto: CreatePulseKeywordDto & { slug: string }) {
    return this.prisma.pulseKeyword.create({ data: dto });
  }

  updateKeyword(id: string, dto: UpdatePulseKeywordDto) {
    return this.prisma.pulseKeyword.update({ where: { id }, data: dto });
  }

  deleteKeyword(id: string) {
    return this.prisma.pulseKeyword.delete({ where: { id } });
  }

  // ── Categories ──────────────────────────────────────────
  findAllCategories() {
    return this.prisma.pulseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findCategoryById(id: string) {
    return this.prisma.pulseCategory.findUnique({ where: { id } });
  }

  createCategory(dto: CreatePulseCategoryDto & { slug: string }) {
    return this.prisma.pulseCategory.create({ data: dto });
  }

  updateCategory(id: string, dto: UpdatePulseCategoryDto) {
    return this.prisma.pulseCategory.update({ where: { id }, data: dto });
  }

  deleteCategory(id: string) {
    return this.prisma.pulseCategory.delete({ where: { id } });
  }
}
