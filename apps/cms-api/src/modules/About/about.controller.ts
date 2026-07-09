import {
  Controller, Get, Put, Body,
  Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { AboutService } from './about.service';
import { UpdateAboutSettingsDto } from './dto/update-about-settings.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('about')
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Get('settings')
  getSettings() {
    return this.service.findSettings();
  }

  @Put('settings')
  updateSettings(@Body() dto: UpdateAboutSettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/about';
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
        return cb(new Error('Yalnız WebP, GIF və SVG'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/about/${file.filename}` };
  }
}