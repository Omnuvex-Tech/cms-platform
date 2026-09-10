import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PageMetaService } from './page-meta.service';
import { UpdatePageMetaDto } from './dto/update-page-meta.dto';

@Controller('page-meta')
export class PageMetaController {
  constructor(private readonly pageMetaService: PageMetaService) {}

  /** Dynamic Pages siyahısı: author | project | pulse detal elementləri. */
  @Get('dynamic/:type')
  listDynamic(@Param('type') type: string) {
    return this.pageMetaService.listDynamicItems(type);
  }

  @Get(':pageKey')
  findOne(@Param('pageKey') pageKey: string) {
    return this.pageMetaService.findByKey(pageKey);
  }

  @Get(':pageKey/schema/preview')
  previewSchema(@Param('pageKey') pageKey: string) {
    return this.pageMetaService.generateSchema(pageKey);
  }

  @Patch(':pageKey/schema')
  saveSchema(
    @Param('pageKey') pageKey: string,
    @Body('schema') schema: Record<string, any> | null,
  ) {
    return this.pageMetaService.saveSchema(pageKey, schema);
  }

  @Patch(':pageKey')
  upsert(
    @Param('pageKey') pageKey: string,
    @Body() dto: UpdatePageMetaDto,
  ) {
    return this.pageMetaService.upsert(pageKey, dto);
  }
}