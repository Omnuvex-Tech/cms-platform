import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { LayihelerimizRepository } from './layihelerimiz.repository';
import { CreateLayihelerimizDto } from './dto/create-layihelerimiz.dto';
import { UpdateLayihelerimizDto } from './dto/update-layihelerimiz.dto';
import { ReorderLayihelerimizDto } from './dto/reorder-layihelerimiz.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Nüsxənin başlığını işarələyir. Başlıq lokallaşdırılmış JSON-dur, ona görə
 * hər dil ayrıca işlənir; köhnə sətir formatı da qorunur.
 */
function appendCopySuffix(title: unknown) {
  const suffix = ' (kopya)';
  if (typeof title === 'string') return `${title}${suffix}`;
  if (!title || typeof title !== 'object') return title;

  return Object.fromEntries(
    Object.entries(title as Record<string, unknown>).map(([locale, value]) => [
      locale,
      typeof value === 'string' && value.trim() ? `${value}${suffix}` : value,
    ]),
  );
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

  // Qeyd: await olmadan Promise həmişə truthy-dir, ona görə 404 heç vaxt atılmırdı.
  async findOne(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Kateqoriya tapılmadı');
    return item;
  }

  async findBySlug(slug: string) {
    const item = await this.repo.findBySlug(slug);
    if (!item) throw new NotFoundException('Kateqoriya tapılmadı');
    return item;
  }

  reorder(dto: ReorderLayihelerimizDto) {
    return this.repo.reorder(dto.ids);
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

  /**
   * Layihənin tam nüsxəsi: kartın bütün sahələri + detal səhifəsinin blokları.
   *
   * Slug unikaldır, ona görə `-kopya` sonluğu əlavə olunur; o ad da tutulubsa
   * nömrələnir. Başlığa da "(kopya)" yazılır — eyni adlı iki sətir arasında
   * admin hansının nüsxə olduğunu ayıra bilməzdi.
   */
  async duplicate(id: string) {
    const source = await this.findOne(id);
    const [slug, detail] = await Promise.all([
      this.buildCopySlug(source.slug),
      this.repo.findDetailBySlug(source.slug),
    ]);

    return this.repo.duplicate({
      category: source,
      detail,
      slug,
      title: appendCopySuffix(source.title),
    });
  }

  private async buildCopySlug(slug: string) {
    const base = `${slug}-kopya`;
    if (!(await this.repo.findBySlug(base))) return base;

    // Praktikada bir neçə nüsxədən çox olmur; hədd sonsuz döngəyə qarşıdır.
    for (let index = 2; index <= 100; index += 1) {
      const candidate = `${base}-${index}`;
      if (!(await this.repo.findBySlug(candidate))) return candidate;
    }
    throw new ConflictException('Bu layihə üçün çox sayda nüsxə var');
  }
}
