import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q: string = '',
    @Query('locale') locale: string = 'az',
    @Query('limit') limit?: string,
    @Query('excerptLength') excerptLength?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedExcerptLength = excerptLength ? parseInt(excerptLength, 10) : 140;
    return this.searchService.search(q.trim(), locale, parsedLimit, parsedExcerptLength);
  }
}