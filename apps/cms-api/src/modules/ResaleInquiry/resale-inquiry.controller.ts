import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ResaleInquiryService } from './resale-inquiry.service';
import { CreateResaleInquiryDto } from './dto/create-resale-inquiry.dto';

@Controller('resale-inquiries')
export class ResaleInquiryController {
  constructor(private readonly service: ResaleInquiryService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateResaleInquiryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
