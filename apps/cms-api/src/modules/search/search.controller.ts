import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q: string = '',
    @Query('locale') locale: string = 'az',
  ) {
    return this.searchService.search(q.trim(), locale);
  }
}