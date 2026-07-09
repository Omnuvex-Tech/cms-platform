import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { ReorderPortfolioDto } from './dto/reorder-portfolio.dto';
import { CreatePortfolioSettingsDto } from './dto/create-portfolio-settings.dto';
import { UpdatePortfolioSettingsDto } from './dto/update-portfolio-settings.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly service: PortfolioService) { }

  @Get('settings')
  getSettings() {
    return this.service.getPortfolioSettings();
  }

  @Post('settings')
  createSettings(@Body() dto: CreatePortfolioSettingsDto) {
    return this.service.createPortfolioSettings(dto);
  }

  @Put('settings/:id')
  updateSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePortfolioSettingsDto,
  ) {
    return this.service.updatePortfolioSettings(id, dto);
  }

  @Get('public')
  findAllVisible() {
    return this.service.findAllVisible();
  }

  @Get('homepage')
  findHomepage() {
    return this.service.findHomepage();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id/schema/preview')
  previewSchema(@Param('id', ParseIntPipe) id: number) {
    return this.service.generateSchema(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePortfolioDto) {
    return this.service.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/uploads/portfolio';
          if (!fs.existsSync(uploadPath))
            fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
   fileFilter: (req, file, cb) => {
        if (!['image/webp', 'image/gif', 'video/mp4'].includes(file.mimetype))
          return cb(new Error('Yalnız WebP, GIF və MP4 formatları qəbul edilir'), false);
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/portfolio/${file.filename}` };
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/schema')
  saveSchema(
    @Param('id', ParseIntPipe) id: number,
    @Body('schema') schema: Record<string, any> | null,
  ) {
    return this.service.saveSchema(id, schema);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderPortfolioDto) {
    return this.service.reorder(dto);
  }

  @Patch(':id/visibility')
  toggleVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.service.toggleVisibility(id, Boolean(isVisible));
  }

  @Patch(':id/homepage')
  toggleHomepage(
    @Param('id', ParseIntPipe) id: number,
    @Body('isHomepage') isHomepage: boolean,
  ) {
    return this.service.toggleHomepage(id, Boolean(isHomepage));
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}