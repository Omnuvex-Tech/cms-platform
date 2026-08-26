import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { OffPlanInquiryService } from './off-plan-inquiry.service';
import { CreateOffPlanInquiryDto } from './dto/create-off-plan-inquiry.dto';

@Controller('off-plan-inquiries')
export class OffPlanInquiryController {
  constructor(private readonly service: OffPlanInquiryService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateOffPlanInquiryDto) {
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
