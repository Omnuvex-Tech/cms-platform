import {
  Controller, Get, Post, Put, Patch,
  Delete, Body, Param, ParseIntPipe,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ReorderTestimonialDto } from './dto/reorder-testimonial.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Get()
  findSection() {
    return this.service.findSection();
  }

  @Post('section')
  createSection(@Body() dto: CreateSectionDto) {
    return this.service.createSection(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/testimonials';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Yalnız şəkil faylları qəbul edilir'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/testimonials/${file.filename}` };
  }

  @Put('section/:id')
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.service.updateSection(id, dto);
  }

  @Post()
  createTestimonial(@Body() dto: CreateTestimonialDto) {
    return this.service.createTestimonial(dto);
  }

  @Put(':id')
  updateTestimonial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.service.updateTestimonial(id, dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderTestimonialDto) {
    return this.service.reorder(dto);
  }

  @Delete(':id')
  deleteTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteTestimonial(id);
  }
}