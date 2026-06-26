import { Module } from '@nestjs/common';
import { PageMetaController } from './page-meta.controller';
import { PageMetaService } from './page-meta.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PageMetaController],
  providers: [PageMetaService],
  exports: [PageMetaService],
})
export class PageMetaModule {}