import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ProjectInquiryService } from './project-inquiry.service';
import { CreateProjectInquiryDto } from './dto/create-project-inquiry.dto';

@Controller('project-inquiries')
export class ProjectInquiryController {
  constructor(private readonly service: ProjectInquiryService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateProjectInquiryDto) {
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
