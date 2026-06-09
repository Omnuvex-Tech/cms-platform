import { Module } from '@nestjs/common';
import { FooterController } from './footer.controller';
import { FooterService } from './footer.service';
import { FooterRepository } from './footer.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FooterController],
  providers: [FooterService, FooterRepository],
  exports: [FooterService],
})
export class FooterModule {}