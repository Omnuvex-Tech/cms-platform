import { Injectable } from '@nestjs/common';
import { AboutRepository } from './about.repository';
import { UpdateAboutSettingsDto } from './dto/update-about-settings.dto';

@Injectable()
export class AboutService {
  constructor(private readonly repo: AboutRepository) {}

  findSettings() { return this.repo.findSettings(); }

  updateSettings(dto: UpdateAboutSettingsDto) {
    return this.repo.updateSettings(dto);
  }
}