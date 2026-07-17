import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    return this.repo.create({ ...dto, slug });
  }

  async update(id: string, dto: UpdateLayihelerimizDto) {
    await this.findOne(id);
    const newSlug = dto.slug;
    if (newSlug) {
      const existing = await this.repo.findBySlug(newSlug);
      if (existing && existing.id !== id) throw new ConflictException('Bu slug artıq mövcuddur');
    }
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
