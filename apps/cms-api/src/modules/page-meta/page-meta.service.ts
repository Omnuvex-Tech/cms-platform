import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePageMetaDto } from './dto/update-page-meta.dto';
import { generatePageSchema } from './schema-generator';

@Injectable()
export class PageMetaService {
  private readonly logger = new Logger(PageMetaService.name);

  constructor(private prisma: PrismaService) {}

  async findByKey(pageKey: string) {
    return this.prisma.pageMeta.findUnique({
      where: { pageKey },
    });
  }

 async upsert(pageKey: string, dto: UpdatePageMetaDto) {
  const result = await this.prisma.pageMeta.upsert({
    where: { pageKey },
    update: {
      seoTitle: dto.seoTitle as any,
      seoDescription: dto.seoDescription as any,
      seoKeywords: dto.seoKeywords as any,
    },
    create: {
      pageKey,
      seoTitle: dto.seoTitle as any,
      seoDescription: dto.seoDescription as any,
      seoKeywords: dto.seoKeywords as any,
    },
  });
  void this.revalidateSite(pageKey);
  return result;
}

  /**
   * treva-web-ə "bu səhifənin SEO-su dəyişdi, keşi təzələ" siqnalı.
   * Fire-and-forget: heç vaxt throw etmir, admin cavabını ləngitmir.
   */
  private async revalidateSite(pageKey: string) {
    const base = process.env.SITE_REVALIDATE_URL;
    const secret = process.env.SITE_REVALIDATE_SECRET;
    if (!base || !secret) {
      this.logger.warn(
        'SITE_REVALIDATE_URL/SECRET set deyil — treva-web revalidate ötürülür',
      );
      return;
    }
    try {
      const url = `${base}?secret=${encodeURIComponent(
        secret,
      )}&pageKey=${encodeURIComponent(pageKey)}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) {
        this.logger.warn(`treva-web revalidate ${res.status} (${pageKey})`);
      }
    } catch (e) {
      this.logger.warn(`treva-web revalidate xətası (${pageKey}): ${e}`);
    }
  }

  /** JSON-LD-ni yaradır, amma yazmır — CMS-də önizləmə üçün. */
  async generateSchema(pageKey: string) {
    const meta = await this.prisma.pageMeta.findUnique({ where: { pageKey } });
    const baseUrl = process.env.SITE_URL || 'https://treva.realestate';
    const entity = await this.resolveDynamicEntity(pageKey);
    return generatePageSchema(pageKey, meta, baseUrl, entity);
  }

  /**
   * `author:<id>` / `project:<id>` / `pulse:<id>` açarları üçün əlaqəli
   * elementin slug + adını gətirir ki, schema düzgün URL və başlıqla qurulsun.
   */
  private async resolveDynamicEntity(pageKey: string) {
    const idx = pageKey.indexOf(':');
    if (idx === -1) return undefined;
    const type = pageKey.slice(0, idx);
    const id = pageKey.slice(idx + 1);
    const pick = (j: any) => j?.en || j?.az || j?.ru || '';
    try {
      if (type === 'author') {
        const a = await this.prisma.pulseAuthor.findUnique({
          where: { id },
          select: { slug: true, name: true },
        });
        return a ? { slug: a.slug, name: pick(a.name) } : undefined;
      }
      if (type === 'pulse') {
        const a = await this.prisma.pulseArticle.findUnique({
          where: { id },
          select: { slug: true, title: true },
        });
        return a ? { slug: a.slug, name: pick(a.title) } : undefined;
      }
      if (type === 'project') {
        const c = await this.prisma.layihelerimizCategory.findUnique({
          where: { id },
          select: { slug: true, title: true },
        });
        return c ? { slug: c.slug, name: pick(c.title) } : undefined;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  /** Dynamic Pages sol siyahısı üçün elementlər. */
  async listDynamicItems(type: string) {
    const pick = (j: any) => j?.en || j?.az || j?.ru || '(adsız)';
    if (type === 'author') {
      const rows = await this.prisma.pulseAuthor.findMany({
        select: { id: true, slug: true, name: true },
        orderBy: { order: 'asc' },
      });
      return rows.map((r) => ({ id: r.id, slug: r.slug, label: pick(r.name) }));
    }
    if (type === 'project') {
      const rows = await this.prisma.layihelerimizCategory.findMany({
        select: { id: true, slug: true, title: true },
        orderBy: { order: 'asc' },
      });
      return rows.map((r) => ({ id: r.id, slug: r.slug, label: pick(r.title) }));
    }
    if (type === 'pulse') {
      const rows = await this.prisma.pulseArticle.findMany({
        select: { id: true, slug: true, title: true },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map((r) => ({ id: r.id, slug: r.slug, label: pick(r.title) }));
    }
    return [];
  }

  /** Admin təsdiqlədikdən sonra JSON-LD-ni saxlayır. */
  async saveSchema(pageKey: string, schema: Record<string, any> | null) {
    const result = await this.prisma.pageMeta.upsert({
      where: { pageKey },
      update: { schema: schema as any },
      create: { pageKey, schema: schema as any },
    });
    void this.revalidateSite(pageKey);
    return result;
  }
}