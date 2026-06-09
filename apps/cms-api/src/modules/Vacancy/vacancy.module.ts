import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancyRepository } from './vacancy.repository';
import { VacancyHeaderService } from './vacancy-header.service';
import { VacancyHeaderRepository } from './vacancy-header.repository';;
import { VacancySettingsService } from './vacancy-settings.service';
import { VacancySettingsRepository } from './vacancy-settings.repository';
import { VacancySettingsController } from './vacancy-settings.controller';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [PrismaModule, MailModule],
  controllers: [VacancyController, VacancySettingsController],
  providers: [
    VacancyService,
    VacancyRepository,
    VacancyHeaderService,
    VacancyHeaderRepository,
    VacancySettingsService,
    VacancySettingsRepository
  ],
})
export class VacancyModule {}