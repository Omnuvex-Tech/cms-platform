import { Injectable } from '@nestjs/common';
import { VacancyHeaderRepository } from './vacancy-header.repository';
import { UpdateVacancyHeaderDto } from './dto/update-vacancy-header.dto';

@Injectable()
export class VacancyHeaderService {
  constructor(private readonly repo: VacancyHeaderRepository) {}

  getHeader() {
    return this.repo.findHeader();
  }

  updateHeader(dto: UpdateVacancyHeaderDto) {
    return this.repo.upsertHeader(dto);
  }
}