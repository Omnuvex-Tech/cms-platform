import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PageMetaService } from './page-meta.service';
import { UpdatePageMetaDto } from './dto/update-page-meta.dto';

@Controller('page-meta')
export class PageMetaController {
  constructor(private readonly pageMetaService: PageMetaService) {}

  @Get(':pageKey')
  findOne(@Param('pageKey') pageKey: string) {
    return this.pageMetaService.findByKey(pageKey);
  }

  @Patch(':pageKey')
  upsert(
    @Param('pageKey') pageKey: string,
    @Body() dto: UpdatePageMetaDto,
  ) {
    return this.pageMetaService.upsert(pageKey, dto);
  }
}