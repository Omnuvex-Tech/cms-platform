import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateVacancySettingsDto } from './dto/update-vacancy-settings.dto';

@Injectable()
export class VacancySettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.vacancySettings.findFirst();
    if (!settings) {
      settings = await this.prisma.vacancySettings.create({ data: {} });
    }
    return settings;
  }

  async updateSettings(dto: UpdateVacancySettingsDto) {
    const settings = await this.getSettings();
    return this.prisma.vacancySettings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}