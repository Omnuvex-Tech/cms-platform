import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { LayihelerimizRepository } from './layihelerimiz.repository';
import { CreateLayihelerimizDto } from './dto/create-layihelerimiz.dto';
import { UpdateLayihelerimizDto } from './dto/update-layihelerimiz.dto';

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
export class LayihelerimizService {
  constructor(private readonly repo: LayihelerimizRepository) {}

  private async validateSlugAgainstTrevaApi(slug: string): Promise<void> {
    const trevaApiUrl = process.env.TREVA_API_URL || 'http://localhost:10011/api/v1';
    try {
      const res = await fetch(`${trevaApiUrl}/categories/slug/${slug}`);
      if (!res.ok) {
        throw new BadRequestException(
          `Slug "${slug}" treva-api-də tapılmadı. Əvvəlcə treva-inventory-də bu slug ilə Category yaradın.`
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(
        `treva-api ilə əlaqə qurmaq mümkün olmadı. Slug yoxlanması aparılmadı.`
      );
    }
  }

  findAll() {
    return this.repo.findAll();
  }

  findVisible() {
    return this.repo.findVisible();
  }

  findOne(id: string) {
    const item = this.repo.findById(id);
    if (!item) throw new NotFoundException('Kateqoriya tapılmadı');
    return item;
  }

  findBySlug(slug: string) {
    const item = this.repo.findBySlug(slug);
    if (!item) throw new NotFoundException('Kateqoriya tapılmadı');
    return item;
  }

  async create(dto: CreateLayihelerimizDto) {
    const slug = dto.slug || slugify(typeof dto.title === 'object' ? (dto.title?.az || Object.values(dto.title)[0] || '') : dto.title);
    const existing = await this.repo.findBySlug(slug);
    if (existing) throw new ConflictException('Bu slug artıq mövcuddur');
    await this.validateSlugAgainstTrevaApi(slug);
    return this.repo.create({ ...dto, slug });
  }

  async update(id: string, dto: UpdateLayihelerimizDto) {
    await this.findOne(id);
    const newSlug = dto.slug;
    if (newSlug) {
      const existing = await this.repo.findBySlug(newSlug);
      if (existing && existing.id !== id) throw new ConflictException('Bu slug artıq mövcuddur');
      await this.validateSlugAgainstTrevaApi(newSlug);
    }
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
