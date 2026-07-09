import { Module } from '@nestjs/common';
import { NavbarSettingsController } from './navbar.controller';
import { NavbarSettingsService } from './navbar.service';
import { NavbarSettingsRepository } from './navbar.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NavbarSettingsController],
  providers: [NavbarSettingsService, NavbarSettingsRepository],
  exports: [NavbarSettingsService],
})
export class NavbarSettingsModule {}