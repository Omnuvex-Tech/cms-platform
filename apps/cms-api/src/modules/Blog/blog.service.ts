import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogAuthorDto } from './dto/create-blog-author.dto';
import { UpdateBlogAuthorDto } from './dto/update-blog-author.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { ReorderBlogDto } from './dto/reorder-blog.dto';
import{UpdateBlogSettingsDto} from './dto/update-blog-settings.dto'

@Injectable()
export class BlogService {
  constructor(private readonly repo: BlogRepository) {}

  findAllAuthors() { return this.repo.findAllAuthors(); }

  async findAuthorById(id: number) {
    const a = await this.repo.findAuthorById(id);
    if (!a) throw new NotFoundException('Author tapılmadı');
    return a;
  }

  createAuthor(dto: CreateBlogAuthorDto) { return this.repo.createAuthor(dto); }

  async updateAuthor(id: number, dto: UpdateBlogAuthorDto) {
    await this.findAuthorById(id);
    return this.repo.updateAuthor(id, dto);
  }

  async deleteAuthor(id: number) {
    await this.findAuthorById(id);
    return this.repo.deleteAuthor(id);
  }

  findAllCategories() { return this.repo.findAllCategories(); }

  async findCategoryById(id: number) {
    const c = await this.repo.findCategoryById(id);
    if (!c) throw new NotFoundException('Kateqoriya tapılmadı');
    return c;
  }

  createCategory(dto: CreateBlogCategoryDto) { return this.repo.createCategory(dto); }

  async updateCategory(id: number, dto: UpdateBlogCategoryDto) {
    await this.findCategoryById(id);
    return this.repo.updateCategory(id, dto);
  }

  async deleteCategory(id: number) {
    await this.findCategoryById(id);
    return this.repo.deleteCategory(id);
  }

  findAll() { return this.repo.findAll(); }
  findAllVisible() { return this.repo.findAllVisible(); }

  async findOne(id: number) {
    const b = await this.repo.findOne(id);
    if (!b) throw new NotFoundException('Blog tapılmadı');
    return b;
  }

  async findBySlug(slug: string) {
    const b = await this.repo.findBySlug(slug);
    if (!b) throw new NotFoundException('Blog tapılmadı');
    return b;
  }

  async create(dto: CreateBlogDto) {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) throw new ConflictException('Bu slug artıq mövcuddur');
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateBlogDto) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.repo.findBySlug(dto.slug);
      if (existing && existing.id !== id) throw new ConflictException('Bu slug artıq mövcuddur');
    }
    return this.repo.update(id, dto);
  }

  async toggleVisibility(id: number, isVisible: boolean) {
    await this.findOne(id);
    return this.repo.toggleVisibility(id, isVisible);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  reorder(dto: ReorderBlogDto) { return this.repo.reorder(dto.ids); }

async findFeatured() {
  const blogs = await this.repo.findFeatured();
  const main = blogs.find(b => b.isFeaturedMain) ?? null;
  const side = blogs
    .filter(b => b.id !== main?.id)
    .slice(0, 3);
  return { main, side };
}

getHomeBlogs() {
  return this.repo.findHomeBlogs();
}
async findAuthorBySlug(slug: string) {
  const a = await this.repo.findAuthorBySlug(slug);
  if (!a) throw new NotFoundException('Author tapılmadı');
  return a;
}

findBlogsByAuthorSlug(slug: string) {
  return this.repo.findBlogsByAuthorSlug(slug);
}

findAuthorList() {
  return this.repo.findAuthorList();
}


findSettings() { return this.repo.findSettings(); }
updateSettings(dto: UpdateBlogSettingsDto) { return this.repo.updateSettings(dto); }

findOurTeamAuthors() { return this.repo.findOurTeamAuthors(); }
findAboutTeamAuthors() { return this.repo.findAboutTeamAuthors(); }
reorderAuthors(ids: number[]) { return this.repo.reorderAuthors(ids); }
}


