import { Injectable } from '@nestjs/common';
import { HomeRepository } from './home.repository';
import { UpdateHomeDto } from './dto/update-home.dto';

@Injectable()
export class HomeService {
  constructor(private readonly repo: HomeRepository) {}

  get() { return this.repo.get(); }
  update(dto: UpdateHomeDto) { return this.repo.update(dto); }
}