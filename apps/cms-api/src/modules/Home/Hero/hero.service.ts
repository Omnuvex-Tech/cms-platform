import { Injectable } from '@nestjs/common';
import { HeroRepository } from './hero.repository';
import { UpdateHeroDto } from './dto/update-hero.dto';

@Injectable()
export class HeroService {
  constructor(private readonly repo: HeroRepository) {}

  get() { return this.repo.get(); }
  update(dto: UpdateHeroDto) { return this.repo.update(dto); }
}