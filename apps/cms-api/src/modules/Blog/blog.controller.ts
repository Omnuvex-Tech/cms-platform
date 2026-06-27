import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreateBlogAuthorDto } from './dto/create-blog-author.dto';
import { UpdateBlogAuthorDto } from './dto/update-blog-author.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { UpdateOurTeamSettingsDto } from './dto/update-our-team-settings.dto';
import { ReorderBlogDto } from './dto/reorder-blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateBlogSettingsDto } from './dto/update-blog-settings.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('blog')
export class BlogController {
  constructor(private readonly service: BlogService) { }

  // ── Upload ───────────────────────────────────────────
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/blog';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!['image/webp', 'image/gif', 'image/svg+xml', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        return cb(new Error('Yalnız WebP, GIF, SVG, JPEG və PNG formatları'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/blog/${file.filename}` };
  }

  // ── Authors ──────────────────────────────────────────
  @Get('authors/slug/:slug')
  findAuthorBySlug(@Param('slug') slug: string) {
    return this.service.findAuthorBySlug(slug);
  }

  @Get('authors/slug/:slug/blogs')
  findBlogsByAuthorSlug(@Param('slug') slug: string) {
    return this.service.findBlogsByAuthorSlug(slug);
  }

  @Get('authors/our-team')
  findOurTeamAuthors() { return this.service.findOurTeamAuthors(); }

  @Get('authors/about-team')
  findAboutTeamAuthors() { return this.service.findAboutTeamAuthors(); }

  @Patch('authors/reorder')
  reorderAuthors(@Body() dto: { ids: number[] }) {
    return this.service.reorderAuthors(dto.ids);
  }

  @Get('authors')
  findAllAuthors() { return this.service.findAllAuthors(); }

  @Post('authors')
  createAuthor(@Body() dto: CreateBlogAuthorDto) { return this.service.createAuthor(dto); }

  @Put('authors/:id')
  updateAuthor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogAuthorDto) {
    return this.service.updateAuthor(id, dto);
  }

  @Delete('authors/:id')
  deleteAuthor(@Param('id', ParseIntPipe) id: number) { return this.service.deleteAuthor(id); }

  // ── Our Team Settings ────────────────────────────────
  @Get('our-team-settings')
  getOurTeamSettings() { return this.service.findOurTeamSettings(); }

  @Put('our-team-settings')
  updateOurTeamSettings(@Body() dto: UpdateOurTeamSettingsDto) {
    return this.service.updateOurTeamSettings(dto);
  }

  // ── Categories ───────────────────────────────────────
  @Get('categories')
  findAllCategories() { return this.service.findAllCategories(); }

  @Post('categories')
  createCategory(@Body() dto: CreateBlogCategoryDto) { return this.service.createCategory(dto); }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) { return this.service.deleteCategory(id); }

  // ── Blogs (literal routes first) ─────────────────────
  @Get('public')
  findAllVisible() { return this.service.findAllVisible(); }

  @Get('featured')
  findFeatured() { return this.service.findFeatured(); }

  @Get('home')
  getHomeBlogs() { return this.service.getHomeBlogs(); }

  @Get('author-list')
  findAuthorList() { return this.service.findAuthorList(); }

  @Get('settings')
  getSettings() { return this.service.findSettings(); }

  @Put('settings')
  updateSettings(@Body() dto: UpdateBlogSettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) { return this.service.findBySlug(slug); }

  @Patch('reorder')
  reorder(@Body() dto: ReorderBlogDto) { return this.service.reorder(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() dto: CreateBlogDto) { return this.service.create(dto); }

  // ── Blogs (wildcard :id routes last) ─────────────────
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/visibility')
  toggleVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.service.toggleVisibility(id, Boolean(isVisible));
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}