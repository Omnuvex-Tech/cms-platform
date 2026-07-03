import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Body, ParseIntPipe, HttpCode,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { VacancyService } from './vacancy.service';
import { VacancyHeaderService } from './vacancy-header.service';
import { CreateVacancyCategoryDto } from './dto/create-vacancy-category.dto';
import { UpdateVacancyCategoryDto } from './dto/update-vacancy-category.dto';
import { ReorderVacancyCategoryDto } from './dto/reorder-vacancy-category.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ReorderVacancyDto } from './dto/reorder-vacancy.dto';
import { UpdateVacancyHeaderDto } from './dto/update-vacancy-header.dto';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';
import { CreateVacancySubmissionDto } from './dto/create-vacancy-submission.dto';

@Controller('vacancy')
export class VacancyController {
  constructor(
    private readonly service: VacancyService,
    private readonly headerService: VacancyHeaderService,
  ) {}

  @Get('header')
  getHeader() { return this.headerService.getHeader(); }

  @Put('header')
  updateHeader(@Body() dto: UpdateVacancyHeaderDto) {
    return this.headerService.updateHeader(dto);
  }

  @Get('settings')
  getSettings() { return this.service.getSettings(); }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateVacancySettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads/cv';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
fileFilter: (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',   
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    ];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Yalnız PDF, DOC, DOCX qəbul edilir'), false);
    }
    cb(null, true);
},
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadCv(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/cv/${file.filename}` };
  }

  // ─── Submissions ──────────────────────────────────────────
  @Post('submit')
  createSubmission(@Body() dto: CreateVacancySubmissionDto) {
    return this.service.createSubmission(dto);
  }

  @Get('submissions')
  findAllSubmissions() {
    return this.service.findAllSubmissions();
  }

// ─── Filter Tags ─────────────────────────────────────────
  @Get('filter-tags')
  getAllFilterTags() { return this.service.getAllFilterTags(); }

  @Post('filter-tags')
  createFilterTag(@Body('label') label: Record<string, string>) {
    return this.service.createFilterTag(label);
  }

  @Put('filter-tags/reorder')
  reorderFilterTags(@Body('items') items: { id: number; order: number }[]) {
    return this.service.reorderFilterTags(items);
  }

@Put('filter-tags/:id')
  updateFilterTag(
    @Param('id', ParseIntPipe) id: number,
    @Body('label') label: Record<string, string>,
  ) {
    return this.service.updateFilterTag(id, label);
  }

  @Patch('filter-tags/:id/active')
  toggleFilterTagActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.service.toggleFilterTagActive(id, isActive);
  }
  @Delete('filter-tags/:id')
  @HttpCode(200)
  async deleteFilterTag(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteFilterTag(id);
    return { success: true };
  }

  @Get('categories')
  getAllCategories() { return this.service.getAllCategories(); }

  @Post('categories')
  createCategory(@Body() dto: CreateVacancyCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Put('categories/reorder')
  reorderCategories(@Body() dto: ReorderVacancyCategoryDto) {
    return this.service.reorderCategories(dto);
  }

  @Get('categories/:id')
  getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getCategoryById(id);
  }

  @Put('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVacancyCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(200)
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteCategory(id);
    return { success: true };
  }

  // ─── Vacancies ───────────────────────────────────────────
  @Get()
  getAllVacancies() { return this.service.getAllVacancies(); }

  @Post()
  createVacancy(@Body() dto: CreateVacancyDto) {
    return this.service.createVacancy(dto);
  }

  @Put('reorder')
  reorderVacancies(@Body() dto: ReorderVacancyDto) {
    return this.service.reorderVacancies(dto);
  }

  @Get('slug/:slug')
  getVacancyBySlug(@Param('slug') slug: string) {
    return this.service.getVacancyBySlug(slug);
  }


  @Get(':id/schema/preview')
  previewSchema(@Param('id', ParseIntPipe) id: number) {
    return this.service.generateSchema(id);
  }

  @Get(':id')
  getVacancyById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getVacancyById(id);
  }
 
  @Put(':id')
  updateVacancy(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVacancyDto,
  ) {
    return this.service.updateVacancy(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async deleteVacancy(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteVacancy(id);
    return { success: true };
  }

  @Patch(':id/visibility')
  toggleVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.service.toggleVisibility(id, isVisible);
  }

  @Patch(':id/new')
  toggleNew(
    @Param('id', ParseIntPipe) id: number,
    @Body('isNew') isNew: boolean,
  ) {
    return this.service.toggleNew(id, isNew);
  }

  @Patch(':id/schema')
  saveSchema(
    @Param('id', ParseIntPipe) id: number,
    @Body('schema') schema: Record<string, any> | null,
  ) {
    return this.service.saveSchema(id, schema);
  }
}