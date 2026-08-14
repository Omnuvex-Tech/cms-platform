import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ProjectDetailService } from './project-detail.service';
import { CreateProjectDetailDto } from './dto/create-project-detail.dto';
import { UpdateProjectDetailDto } from './dto/update-project-detail.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const maxFileSizeBytes = Number(
  process.env.LAYIHELERIMIZ_DETAILS_UPLOAD_MAX_FILE_SIZE_BYTES ??
    process.env.UPLOAD_MAX_FILE_SIZE_BYTES ??
    50 * 1024 * 1024,
);

@Controller('layihelerimiz/project-details')
export class ProjectDetailController {
  constructor(private readonly service: ProjectDetailService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/layihelerimiz/details';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase();
      const allowed = [
        'image/webp', 'image/jpeg', 'image/png', 'image/jpg',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const extAllowed =
        ext === '.pdf' ||
        ext === '.docx' ||
        ext === '.webp' ||
        ext === '.jpg' ||
        ext === '.jpeg' ||
        ext === '.png';

      if (!allowed.includes(file.mimetype) && !(file.mimetype === 'application/octet-stream' && extAllowed)) {
        return cb(new Error('Yalnız WebP, JPEG, PNG, PDF və DOCX formatları'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: maxFileSizeBytes },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/layihelerimiz/details/${file.filename}` };
  }

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // :slug-dan ƏVVƏL: Nest daha spesifik yolu seçsin.
  @Get(':slug/schema/preview')
  previewSchema(@Param('slug') slug: string) {
    return this.service.generateSchema(slug);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  create(@Body() dto: CreateProjectDetailDto) {
    return this.service.create(dto);
  }

  @Patch(':id/schema')
  saveSchema(
    @Param('id') id: string,
    @Body('schema') schema: Record<string, any> | null,
  ) {
    return this.service.saveSchema(id, schema);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDetailDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
