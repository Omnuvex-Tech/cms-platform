import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAboutSettingsDto } from './dto/update-about-settings.dto';

@Injectable()
export class AboutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSettings() {
    let settings = await this.prisma.aboutSettings.findFirst({
      include: { quoteAuthor: true },
    });
    if (!settings) {
      settings = await this.prisma.aboutSettings.create({
        data: {},
        include: { quoteAuthor: true },
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateAboutSettingsDto) {
    const settings = await this.findSettings();
    return this.prisma.aboutSettings.update({
      where: { id: settings.id },
      data: dto,
      include: { quoteAuthor: true },
    });
  }
}