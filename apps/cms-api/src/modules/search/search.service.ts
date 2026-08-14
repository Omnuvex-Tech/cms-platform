import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildSectionsFromLegacy } from '../Layihelerimiz/project-sections';

export interface SearchResult {
    title: string;
    url: string;
    breadcrumb: string;
    excerpt: string;
}

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) { }

    private t(json: any, locale: string): string {
        if (!json) return '';
        if (typeof json === 'string') return json;
        return json[locale] || json['az'] || '';
    }

    private stripHtml(html: any): string {
        if (!html) return '';
        return String(html).replace(/<[^>]*>/g, '').trim();
    }

    private highlight(text: string, q: string): string {
        if (!text || !q) return text ?? '';
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text.slice(0, 120);
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + q.length + 80);
        return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    }

    /** Pulse məqaləsinin blokları içindən axtarış üçün düz mətn çıxarır. */
    private blocksToText(blocks: any, locale: string): string {
        if (!Array.isArray(blocks)) return '';
        const parts: string[] = [];
        for (const block of blocks) {
            if (!block || block.isVisible === false) continue;
            switch (block.type) {
                case 'heading':
                case 'paragraph':
                case 'quote':
                    parts.push(this.stripHtml(this.t(block.text, locale)));
                    break;
                case 'faq':
                    parts.push(this.stripHtml(this.t(block.question, locale)));
                    parts.push(this.stripHtml(this.t(block.answer, locale)));
                    break;
                case 'list':
                    for (const item of block.items ?? []) {
                        parts.push(this.stripHtml(this.t(item, locale)));
                    }
                    break;
            }
        }
        return parts.filter(Boolean).join(' ');
    }

    /** Layihə bloklarından axtarılabilən mətn yığır. */
    private projectSectionsToText(detail: any, locale: string): string {
        const sections = Array.isArray(detail?.sections) && detail.sections.length > 0
            ? detail.sections
            : buildSectionsFromLegacy(detail ?? {});

        const parts: string[] = [];
        for (const section of sections as any[]) {
            if (!section || section.isVisible === false) continue;
            for (const key of ['title', 'desktopDesc', 'description', 'brandName', 'mainLead', 'subText']) {
                if (section[key]) parts.push(this.stripHtml(this.t(section[key], locale)));
            }
        }
        return parts.filter(Boolean).join(' ');
    }

    async search(q: string, locale: string): Promise<SearchResult[]> {
        if (!q || q.length < 2) return [];

        const lower = q.toLowerCase();
        const results: SearchResult[] = [];

        // --- Layihələr ---
        const categories = await this.prisma.layihelerimizCategory.findMany({
            where: { isVisible: true },
            select: { title: true, slug: true, description: true, brand: true },
        });
        const details = await this.prisma.layihelerimizProjectDetail.findMany();
        const detailBySlug = new Map(details.map(d => [d.categorySlug, d]));

        for (const c of categories) {
            const title = this.stripHtml(this.t(c.title, locale));
            const description = this.stripHtml(this.t(c.description, locale));
            const brand = this.stripHtml(this.t(c.brand, locale));
            const body = this.projectSectionsToText(detailBySlug.get(c.slug), locale);
            const haystack = `${title} ${description} ${brand} ${body}`.toLowerCase();

            if (haystack.includes(lower)) {
                results.push({
                    title,
                    url: `/projects/${c.slug}`,
                    breadcrumb: 'Layihələr',
                    excerpt: this.highlight(description || body, q),
                });
            }
        }

        // --- Pulse məqalələri ---
        const articles = await this.prisma.pulseArticle.findMany({
            where: { published: true },
            select: { title: true, slug: true, category: true, excerpt: true, blocks: true },
        });
        for (const a of articles) {
            const title = this.stripHtml(this.t(a.title, locale));
            const category = this.stripHtml(this.t(a.category, locale));
            const excerpt = this.stripHtml(this.t(a.excerpt, locale));
            const body = this.blocksToText(a.blocks, locale);
            const haystack = `${title} ${category} ${excerpt} ${body}`.toLowerCase();

            if (haystack.includes(lower)) {
                results.push({
                    title,
                    url: `/pulse/${a.slug}`,
                    breadcrumb: category ? `Pulse · ${category}` : 'Pulse',
                    excerpt: this.highlight(excerpt || body, q),
                });
            }
        }

        // --- Pulse müəllifləri ---
        const authors = await this.prisma.pulseAuthor.findMany({
            select: { name: true, slug: true, title: true, description: true },
        });
        for (const a of authors) {
            const name = this.stripHtml(this.t(a.name, locale));
            const role = this.stripHtml(this.t(a.title, locale));
            const bio = this.stripHtml(this.t(a.description, locale));
            if (`${name} ${role} ${bio}`.toLowerCase().includes(lower)) {
                results.push({
                    title: name,
                    url: `/authors/${a.slug}`,
                    breadcrumb: 'Pulse · Müəlliflər',
                    excerpt: this.highlight(bio || role, q),
                });
            }
        }

        // --- Vakansiyalar ---
        const vacancies = await this.prisma.vacancy.findMany({
            where: { isVisible: true },
            select: { title: true, slug: true, tags: true },
        });
        for (const v of vacancies) {
            const title = this.stripHtml(this.t(v.title, locale));
            const tags = this.stripHtml(
                Array.isArray(v.tags)
                    ? (v.tags as any[]).map(tag => this.t(tag, locale)).join(' ')
                    : ''
            );
            if (title.toLowerCase().includes(lower) || tags.toLowerCase().includes(lower)) {
                results.push({
                    title,
                    url: `/Vacancy/${v.slug}`,
                    breadcrumb: 'Vakansiyalar',
                    excerpt: this.highlight(tags, q),
                });
            }
        }

        return results.slice(0, 10);
    }
}
