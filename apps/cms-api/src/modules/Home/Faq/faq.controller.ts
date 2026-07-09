import {
  Controller, Get, Post, Put,
  Patch, Delete, Body, Param, ParseIntPipe,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ReorderFaqDto } from './dto/reorder-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get('public')
  findAllVisible() {
    return this.faqService.findAllVisible();
  }

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderFaqDto) {
    return this.faqService.reorder(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.faqService.update(id, dto);
  }

  @Patch(':id/visibility')
  toggleVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.faqService.toggleVisibility(id, isVisible);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.delete(id);
  }
}