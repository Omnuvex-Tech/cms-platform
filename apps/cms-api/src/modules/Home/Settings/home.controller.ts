import { Controller, Get, Put, Body, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { HomeService } from './home.service';
import { UpdateHomeDto } from './dto/update-home.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('home')
export class HomeController {
  constructor(private readonly service: HomeService) {}

  @Get()
  get() { return this.service.get(); }

  @Put()
  update(@Body() dto: UpdateHomeDto) { return this.service.update(dto); }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const path = './public/uploads/home';
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!['image/webp', 'image/jpeg', 'image/png', 'image/svg+xml'].includes(file.mimetype)) {
        return cb(new Error('Yalnız WebP, JPEG, PNG və SVG formatları'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/home/${file.filename}` };
  }
}