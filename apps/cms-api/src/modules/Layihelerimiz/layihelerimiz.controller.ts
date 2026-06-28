import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { LayihelerimizService } from './layihelerimiz.service';
import { CreateLayihelerimizDto } from './dto/create-layihelerimiz.dto';
import { UpdateLayihelerimizDto } from './dto/update-layihelerimiz.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('layihelerimiz')
export class LayihelerimizController {
  constructor(private readonly service: LayihelerimizService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/layihelerimiz';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!['image/webp', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        return cb(new Error('Yalnız WebP, JPEG və PNG formatları'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/layihelerimiz/${file.filename}` };
  }

  @Public()
  @Get('categories')
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('categories/visible')
  findVisible() {
    return this.service.findVisible();
  }

  @Public()
  @Get('categories/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post('categories')
  create(@Body() dto: CreateLayihelerimizDto) {
    return this.service.create(dto);
  }

  @Patch('categories/:id')
  update(@Param('id') id: string, @Body() dto: UpdateLayihelerimizDto) {
    return this.service.update(id, dto);
  }

  @Delete('categories/:id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
