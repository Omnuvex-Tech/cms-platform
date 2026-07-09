import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

    async search(q: string, locale: string): Promise<SearchResult[]> {
        if (!q || q.length < 2) return [];

        const lower = q.toLowerCase();
        const results: SearchResult[] = [];
        const blogs = await this.prisma.blog.findMany({
            where: { isVisible: true },
            select: { title: true, slug: true, badge: true, excerpt: true },
        });
        for (const b of blogs) {
            const title = this.stripHtml(this.t(b.title, locale));
            const badge = this.stripHtml(this.t(b.badge, locale));
            const excerpt = this.stripHtml(this.t(b.excerpt, locale));
            if (
                title.toLowerCase().includes(lower) ||
                badge.toLowerCase().includes(lower) ||
                excerpt.toLowerCase().includes(lower)
            ) {
                results.push({
                    title,
                    url: `/Blog/${b.slug}`,
                    breadcrumb: `Blog · ${badge}`,
                    excerpt: this.highlight(excerpt, q),
                });
            }
        }
        const portfolios = await this.prisma.portfolio.findMany({
            where: { isVisible: true },
            select: { title: true, slug: true, tags: true },
        });
        for (const p of portfolios) {
            const title = this.stripHtml(this.t(p.title, locale));
            const tags = this.stripHtml((p.tags ?? []).join(' '));
            if (title.toLowerCase().includes(lower) || tags.toLowerCase().includes(lower)) {
                results.push({
                    title,
                    url: `/portfolio/${p.slug}`,
                    breadcrumb: 'Portfolio',
                    excerpt: this.highlight(tags, q),
                });
            }
        }
        const services = await this.prisma.service.findMany({
            where: { isVisible: true },
            select: { title: true, slug: true, badge: true, description: true },
        });
        for (const s of services) {
            const title = this.stripHtml(this.t(s.title, locale));
            const badge = this.stripHtml(this.t(s.badge, locale));
            const desc = this.stripHtml(this.t(s.description, locale));
            if (
                title.toLowerCase().includes(lower) ||
                badge.toLowerCase().includes(lower) ||
                desc.toLowerCase().includes(lower)
            ) {
                results.push({
                    title,
                    url: `/service/${s.slug}`,
                    breadcrumb: `Xidmətlər · ${badge}`,
                    excerpt: this.highlight(desc, q),
                });
            }
        }

        const authors = await this.prisma.blogAuthor.findMany({
            where: { isVisible: true },
            select: { name: true, slug: true, role: true, bio: true },
        });
        for (const a of authors) {
            const name = this.stripHtml(this.t(a.name, locale));
            const role = this.stripHtml(this.t(a.role, locale));
            const bio = this.stripHtml(this.t(a.bio, locale));
            if (
                name.toLowerCase().includes(lower) ||
                role.toLowerCase().includes(lower) ||
                bio.toLowerCase().includes(lower)
            ) {
                results.push({
                    title: name,
                    url: a.slug ? `/BlogAuthor/${a.slug}` : '/blog',
                    breadcrumb: 'Blog · Müəlliflər',
                    excerpt: this.highlight(bio || role, q),
                });
            }
        }
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