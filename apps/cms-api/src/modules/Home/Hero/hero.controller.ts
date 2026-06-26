import { Controller, Get, Put, Body } from '@nestjs/common';
import { HeroService } from './hero.service';
import { UpdateHeroDto } from './dto/update-hero.dto';

@Controller('hero')
export class HeroController {
  constructor(private readonly service: HeroService) {}

  @Get()
  get() { return this.service.get(); }

  @Put()
  update(@Body() dto: UpdateHeroDto) { return this.service.update(dto); }
}