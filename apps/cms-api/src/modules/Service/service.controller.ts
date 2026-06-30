import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ReorderServiceDto } from './dto/reorder-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('services')
export class ServiceController {
  constructor(private readonly service: ServiceService) { }

  @Get('public')
  findAllVisible() { return this.service.findAllVisible(); }

  @Get()
  findAll() { return this.service.findAll(); }

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
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/services';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!['image/webp', 'image/gif', 'image/svg+xml'].includes(file.mimetype)) {
        return cb(new Error('Yalnız WebP, GIF və SVG formatları qəbul edilir'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/services/${file.filename}` };
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderServiceDto) {
    return this.service.reorder(dto);
  }

  @Patch(':id/visibility')
  toggleVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.service.toggleVisibility(id, Boolean(isVisible));
  }

  @Patch(':id/schema')
  saveSchema(
    @Param('id', ParseIntPipe) id: number,
    @Body('schema') schema: Record<string, any> | null,
  ) {
    return this.service.saveSchema(id, schema);
  }
  
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}