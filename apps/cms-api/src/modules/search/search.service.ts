import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SearchResult {
    title: string;
    titleHtml: string;
    url: string;
    breadcrumb: string;
    excerptHtml: string;
}

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) { }

    private t(json: any, locale: string): string {
        if (!json) return '';
        if (typeof json === 'string') return json;
        return json[locale] || json['az'] || '';
    }

private decodeHtmlEntities(text: string): string {
        return text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'");
    }

    private stripHtml(html: any): string {
        if (!html) return '';
        return this.decodeHtmlEntities(String(html).replace(/<[^>]*>/g, '')).trim();
    }

    private normalize(text: string): string {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/ə/g, 'e')
            .replace(/ğ/g, 'g')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c');
    }

    private includesNormalized(text: string, q: string): boolean {
        return this.normalize(text).includes(this.normalize(q));
    }

    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    private boldAll(text: string, q: string): string {
        if (!text) return '';
        if (!q) return this.escapeHtml(text);

        const normText = this.normalize(text);
        const normQ = this.normalize(q);
        if (!normQ) return this.escapeHtml(text);

        let result = '';
        let i = 0;
        while (i < text.length) {
            const idx = normText.indexOf(normQ, i);
            if (idx === -1) {
                result += this.escapeHtml(text.slice(i));
                break;
            }
            result += this.escapeHtml(text.slice(i, idx));
            result += '<strong>' + this.escapeHtml(text.slice(idx, idx + q.length)) + '</strong>';
            i = idx + q.length;
        }
        return result;
    }

    private truncate(text: string, len: number): string {
        if (!text) return '';
        if (text.length <= len) return text;
        return text.slice(0, len).trim() + '...';
    }

    async search(
        q: string,
        locale: string,
        limit?: number,
        excerptLength: number = 140,
    ): Promise<{ total: number; results: SearchResult[] }> {
        if (!q || q.length < 2) return { total: 0, results: [] };

        const matches: { title: string; url: string; breadcrumb: string; rawExcerpt: string }[] = [];
        const blogs = await this.prisma.blog.findMany({
            where: { isVisible: true },
            select: { title: true, slug: true, badge: true, excerpt: true },
        });
        for (const b of blogs) {
            const title = this.stripHtml(this.t(b.title, locale));
            const badge = this.stripHtml(this.t(b.badge, locale));
            const excerpt = this.stripHtml(this.t(b.excerpt, locale));
            if (
                this.includesNormalized(title, q) ||
                this.includesNormalized(badge, q) ||
                this.includesNormalized(excerpt, q)
            ) {
                matches.push({
                    title,
                    url: `/Blog/${b.slug}`,
                    breadcrumb: `Blog · ${badge}`,
                    rawExcerpt: excerpt,
                });
            }
        }

        const portfolios = await this.prisma.portfolio.findMany({
            where: { isVisible: true },
            select: {
                title: true,
                slug: true,
                services: { include: { service: true } },
            },
        });
        for (const p of portfolios) {
            const title = this.stripHtml(this.t(p.title, locale));
            const categoryNames = (p.services ?? [])
                .map((ps: any) => this.stripHtml(this.t(ps.service?.title, locale)))
                .join(' ');
            if (
                this.includesNormalized(title, q) ||
                this.includesNormalized(categoryNames, q)
            ) {
                matches.push({
                    title,
                    url: `/portfolio/${p.slug}`,
                    breadcrumb: 'Portfolio',
                    rawExcerpt: categoryNames,
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
                this.includesNormalized(title, q) ||
                this.includesNormalized(badge, q) ||
                this.includesNormalized(desc, q)
            ) {
                matches.push({
                    title,
                    url: `/service/${s.slug}`,
                    breadcrumb: `Xidmətlər · ${badge}`,
                    rawExcerpt: desc,
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
                this.includesNormalized(name, q) ||
                this.includesNormalized(role, q) ||
                this.includesNormalized(bio, q)
            ) {
                matches.push({
                    title: name,
                    url: a.slug ? `/BlogAuthor/${a.slug}` : '/blog',
                    breadcrumb: 'Blog · Müəlliflər',
                    rawExcerpt: bio || role,
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
            if (
                this.includesNormalized(title, q) ||
                this.includesNormalized(tags, q)
            ) {
                matches.push({
                    title,
                    url: `/Vacancy/${v.slug}`,
                    breadcrumb: 'Vakansiyalar',
                    rawExcerpt: tags,
                });
            }
        }

        const total = matches.length;
        const sliced = limit ? matches.slice(0, limit) : matches;

        const results: SearchResult[] = sliced.map((m) => ({
            title: m.title,
            titleHtml: this.boldAll(m.title, q),
            url: m.url,
            breadcrumb: m.breadcrumb,
            excerptHtml: this.boldAll(this.truncate(m.rawExcerpt, excerptLength), q),
        }));

        return { total, results };
    }
}