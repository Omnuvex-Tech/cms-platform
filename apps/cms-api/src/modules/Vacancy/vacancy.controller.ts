import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Body, ParseIntPipe, HttpCode,
} from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyHeaderService } from './vacancy-header.service';
import { CreateVacancyCategoryDto } from './dto/create-vacancy-category.dto';
import { UpdateVacancyCategoryDto } from './dto/update-vacancy-category.dto';
import { ReorderVacancyCategoryDto } from './dto/reorder-vacancy-category.dto';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ReorderVacancyDto } from './dto/reorder-vacancy.dto';
import { UpdateVacancyHeaderDto } from './dto/update-vacancy-header.dto';

@Controller('vacancy')
export class VacancyController {
  constructor(
    private readonly service: VacancyService,
    private readonly headerService: VacancyHeaderService,
  ) {}

  // ─── Header ──────────────────────────────────────────────
  @Get('header')
  getHeader() { return this.headerService.getHeader(); }

  @Put('header')
  updateHeader(@Body() dto: UpdateVacancyHeaderDto) {
    return this.headerService.updateHeader(dto);
  }

  // ─── Categories ──────────────────────────────────────────
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
  // ─── :id — həmişə ən sonda ───────────────────────────────
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
}