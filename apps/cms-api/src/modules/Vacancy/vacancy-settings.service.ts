import { Injectable } from '@nestjs/common';
import { VacancySettingsRepository } from './vacancy-settings.repository';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';

@Injectable()
export class VacancySettingsService {
  constructor(private readonly repo: VacancySettingsRepository) {}

  getSettings() {
    return this.repo.getSettings();
  }

  updateSettings(dto: UpdateVacancySettingsDto) {
    return this.repo.updateSettings(dto);
  }
}