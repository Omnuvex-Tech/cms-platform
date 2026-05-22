import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerSectionDto } from './dto/create-partner-section.dto';
import { UpdatePartnerSectionDto } from './dto/update-partner-section.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ReorderPartnerDto } from './dto/reorder-partner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('partners')
export class PartnersController {
  constructor(private readonly service: PartnersService) {}

  @Get()
  findSection() { return this.service.findSection(); }

  @Get('homepage')
  findHomepage() { return this.service.findHomepage(); }

  @Post('section')
  createSection(@Body() dto: CreatePartnerSectionDto) {
    return this.service.createSection(dto);
  }

  @Put('section/:id')
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartnerSectionDto,
  ) {
    return this.service.updateSection(id, dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/partners';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'image/webp') return cb(new Error('Yalnız WebP'), false);
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/partners/${file.filename}` };
  }

  @Post()
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.service.createPartner(dto);
  }

  @Put(':id')
  updatePartner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.service.updatePartner(id, dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderPartnerDto) {
    return this.service.reorder(dto);
  }

  @Patch(':id/homepage')
  toggleHomepage(
    @Param('id', ParseIntPipe) id: number,
    @Body('isHomepage') isHomepage: boolean,
  ) {
    return this.service.toggleHomepage(id, Boolean(isHomepage));
  }

  @Patch(':id/visibility')
toggleVisibility(
  @Param('id', ParseIntPipe) id: number,
  @Body('isVisible') isVisible: boolean,
) {
  return this.service.toggleVisibility(id, Boolean(isVisible));
}

  @Delete(':id')
  deletePartner(@Param('id', ParseIntPipe) id: number) {
    return this.service.deletePartner(id);
  }
}