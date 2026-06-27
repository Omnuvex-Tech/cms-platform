import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { PulseService } from './pulse.service';
import { CreatePulseArticleDto } from './dto/create-pulse-article.dto';
import { UpdatePulseArticleDto } from './dto/update-pulse-article.dto';
import { CreatePulseAuthorDto } from './dto/create-pulse-author.dto';
import { UpdatePulseAuthorDto } from './dto/update-pulse-author.dto';
import { CreatePulseKeywordDto } from './dto/create-pulse-keyword.dto';
import { UpdatePulseKeywordDto } from './dto/update-pulse-keyword.dto';
import { CreatePulseCategoryDto } from './dto/create-pulse-category.dto';
import { UpdatePulseCategoryDto } from './dto/update-pulse-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('pulse')
export class PulseController {
  constructor(private readonly service: PulseService) { }

  // ── Upload ───────────────────────────────────────────
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/pulse';
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
    return { url: `/uploads/pulse/${file.filename}` };
  }

  // ── Articles ──────────────────────────────────────────
  @Get('articles')
  findPublishedArticles() {
    return this.service.findPublishedArticles();
  }

  @Get('articles/all')
  findAllArticles() {
    return this.service.findAllArticles();
  }

  @Get('articles/header')
  findHeaderArticles(@Query('position') position: string) {
    return this.service.findHeaderArticles(position);
  }

  @Get('articles/featured')
  findFeaturedArticles() {
    return this.service.findFeaturedArticles();
  }

  @Get('articles/slug/:slug')
  findArticleBySlug(@Param('slug') slug: string) {
    return this.service.findArticleBySlug(slug);
  }

  @Get('articles/:id')
  findArticleById(@Param('id') id: string) {
    return this.service.findArticleById(id);
  }

  @Post('articles')
  createArticle(@Body() dto: CreatePulseArticleDto) {
    return this.service.createArticle(dto);
  }

  @Put('articles/:id')
  updateArticle(@Param('id') id: string, @Body() dto: UpdatePulseArticleDto) {
    return this.service.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.service.deleteArticle(id);
  }

  // ── Authors ──────────────────────────────────────────
  @Get('authors')
  findAllAuthors() {
    return this.service.findAllAuthors();
  }

  @Get('authors/slug/:slug')
  findAuthorBySlug(@Param('slug') slug: string) {
    return this.service.findAuthorBySlug(slug);
  }

  @Get('authors/:id')
  findAuthorById(@Param('id') id: string) {
    return this.service.findAuthorById(id);
  }

  @Post('authors')
  createAuthor(@Body() dto: CreatePulseAuthorDto) {
    return this.service.createAuthor(dto);
  }

  @Put('authors/:id')
  updateAuthor(@Param('id') id: string, @Body() dto: UpdatePulseAuthorDto) {
    return this.service.updateAuthor(id, dto);
  }

  @Delete('authors/:id')
  deleteAuthor(@Param('id') id: string) {
    return this.service.deleteAuthor(id);
  }

  // ── Keywords ──────────────────────────────────────────
  @Get('keywords')
  findAllKeywords() {
    return this.service.findAllKeywords();
  }

  @Get('keywords/slug/:slug')
  findKeywordBySlug(@Param('slug') slug: string) {
    return this.service.findKeywordBySlug(slug);
  }

  @Get('keywords/:id')
  findKeywordById(@Param('id') id: string) {
    return this.service.findKeywordById(id);
  }

  @Post('keywords')
  createKeyword(@Body() dto: CreatePulseKeywordDto) {
    return this.service.createKeyword(dto);
  }

  @Put('keywords/:id')
  updateKeyword(@Param('id') id: string, @Body() dto: UpdatePulseKeywordDto) {
    return this.service.updateKeyword(id, dto);
  }

  @Delete('keywords/:id')
  deleteKeyword(@Param('id') id: string) {
    return this.service.deleteKeyword(id);
  }

  // ── Categories ──────────────────────────────────────────
  @Get('categories')
  findAllCategories() {
    return this.service.findAllCategories();
  }

  @Get('categories/:id')
  findCategoryById(@Param('id') id: string) {
    return this.service.findCategoryById(id);
  }

  @Post('categories')
  createCategory(@Body() dto: CreatePulseCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdatePulseCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(id);
  }
}
