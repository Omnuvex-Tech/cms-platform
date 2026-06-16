import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogAuthorDto } from './dto/create-blog-author.dto';
import { UpdateBlogAuthorDto } from './dto/update-blog-author.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { UpdateBlogSettingsDto } from './dto/update-blog-settings.dto'
import { UpdateOurTeamSettingsDto } from './dto/update-our-team-settings.dto';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) { }

  findAllAuthors() {
    return this.prisma.blogAuthor.findMany({ orderBy: { order: 'asc' } });
  }

  findAuthorById(id: number) {
    return this.prisma.blogAuthor.findUnique({ where: { id } });
  }

  createAuthor(dto: CreateBlogAuthorDto) {
    return this.prisma.blogAuthor.create({
      data: {
        ...dto,
        skills: dto.skills ?? [],
      },
    });
  }

  updateAuthor(id: number, dto: UpdateBlogAuthorDto) {
    return this.prisma.blogAuthor.update({ where: { id }, data: dto });
  }

deleteAuthor(id: number) {
    return this.prisma.blogAuthor.delete({ where: { id } });
  }

  findAuthorBySlug(slug: string) {
    return this.prisma.blogAuthor.findUnique({ where: { slug } });
  }

  findBlogsByAuthorSlug(slug: string) {
    return this.prisma.blog.findMany({
      where: {
        isVisible: true,
        author: { slug },
      },
      orderBy: { order: 'asc' },
      include: { author: true, category: true },
    });
  }

  findAllCategories() {
    return this.prisma.blogCategory.findMany({ orderBy: { order: 'asc' } });
  }

  findCategoryById(id: number) {
    return this.prisma.blogCategory.findUnique({ where: { id } });
  }

  createCategory(dto: CreateBlogCategoryDto) {
    return this.prisma.blogCategory.create({ data: dto });
  }

  updateCategory(id: number, dto: UpdateBlogCategoryDto) {
    return this.prisma.blogCategory.update({ where: { id }, data: dto });
  }

  deleteCategory(id: number) {
    return this.prisma.blogCategory.delete({ where: { id } });
  }

  findAll() {
    return this.prisma.blog.findMany({
      orderBy: { order: 'asc' },
      include: { author: true, category: true },
    });
  }

  findAllVisible() {
    return this.prisma.blog.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
      include: { author: true, category: true },
    });
  }

  findOne(id: number) {
    return this.prisma.blog.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.blog.findUnique({
      where: { slug },
      include: { author: true, category: true },
    });
  }

  create(dto: CreateBlogDto) {
    return this.prisma.blog.create({
      data: {
        ...dto,
        hashtags: dto.hashtags ?? [],
        sections: dto.sections ?? [],
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      },
      include: { author: true, category: true },
    });
  }

  update(id: number, dto: UpdateBlogDto) {
    return this.prisma.blog.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
      include: { author: true, category: true },
    });
  }

  toggleVisibility(id: number, isVisible: boolean) {
    return this.prisma.blog.update({ where: { id }, data: { isVisible } });
  }

  delete(id: number) {
    return this.prisma.blog.delete({ where: { id } });
  }

  async reorder(ids: number[]) {
    const updates = ids.map((id, index) =>
      this.prisma.blog.update({ where: { id }, data: { order: index } })
    );
    return this.prisma.$transaction(updates);
  }

findFeatured() {
  return this.prisma.blog.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true, category: true },
  });
}

  
  async findSettings() {
    let settings = await this.prisma.blogSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.blogSettings.create({ data: {} });
    }
    return settings;
  }

  async updateSettings(dto: UpdateBlogSettingsDto) {
    const settings = await this.findSettings();
    return this.prisma.blogSettings.update({ where: { id: settings.id }, data: dto });
  }

  findHomeBlogs() {
  return this.prisma.blog.findMany({
    where: { isHomeVisible: true, isVisible: true },
    orderBy: { order: 'asc' },
    take: 3,
    include: { author: true, category: true },
  });
}
async findAuthorList() {
  const pinned = await this.prisma.blog.findMany({
    where: { isVisible: true, isAuthorList: true, authorListPinnedAt: { not: null } },
    orderBy: { authorListPinnedAt: 'desc' },
    include: { author: true, category: true },
  });

  const pinnedIds = pinned.map(b => b.id);
  const slots = 4 - pinned.length;

  const auto = slots > 0
    ? await this.prisma.blog.findMany({
        where: { isVisible: true, id: { notIn: pinnedIds.length ? pinnedIds : [-1] } },
        orderBy: { createdAt: 'desc' },
        take: slots,
        include: { author: true, category: true },
      })
    : [];

  return [...pinned, ...auto];
}

findOurTeamAuthors() {
  return this.prisma.blogAuthor.findMany({
    where: { isOurTeam: true, isVisible: true },
    orderBy: { order: 'asc' },
  });
}

findAboutTeamAuthors() {
  return this.prisma.blogAuthor.findMany({
    where: { isOurTeam: true, isVisible: true },
    orderBy: { order: 'asc' },
    take: 6,
  });
}

async reorderAuthors(ids: number[]) {
  const updates = ids.map((id, index) =>
    this.prisma.blogAuthor.update({ where: { id }, data: { order: index } })
  );
  return this.prisma.$transaction(updates);
}

async findOurTeamSettings() {
  let s = await this.prisma.ourTeamSettings.findFirst();
  if (!s) s = await this.prisma.ourTeamSettings.create({ data: {} });
  return s;
}

async updateOurTeamSettings(dto: UpdateOurTeamSettingsDto) {
  const s = await this.findOurTeamSettings();
  return this.prisma.ourTeamSettings.update({
    where: { id: s.id },
    data: dto,
  });
}
}