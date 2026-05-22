import { Controller, Get, Put, Body } from '@nestjs/common';
import { VacancySettingsService } from './vacancy-settings.service';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';

@Controller('vacancy-settings')
export class VacancySettingsController {
  constructor(private readonly service: VacancySettingsService) {}

  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  @Put()
  updateSettings(@Body() dto: UpdateVacancySettingsDto) {
    return this.service.updateSettings(dto);
  }
}