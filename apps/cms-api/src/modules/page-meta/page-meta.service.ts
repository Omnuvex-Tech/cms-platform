import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePageMetaDto } from './dto/update-page-meta.dto';
import { generatePageSchema } from './schema-generator';

@Injectable()
export class PageMetaService {
  constructor(private prisma: PrismaService) { }

  async findByKey(pageKey: string) {
    return this.prisma.pageMeta.findUnique({
      where: { pageKey },
    });
  }

  async upsert(pageKey: string, dto: UpdatePageMetaDto) {
    return this.prisma.pageMeta.upsert({
      where: { pageKey },
      update: {
        seoTitle: dto.seoTitle as any,
        seoDescription: dto.seoDescription as any,
        seoKeywords: dto.seoKeywords as any,
      },
      create: {
        pageKey,
        seoTitle: dto.seoTitle as any,
        seoDescription: dto.seoDescription as any,
        seoKeywords: dto.seoKeywords as any,
      },
    });
  }



  async generateSchema(pageKey: string) {
    const meta = await this.prisma.pageMeta.findUnique({
      where: { pageKey },
    });

    const baseUrl = process.env.SITE_URL!;
    return generatePageSchema(pageKey, meta, baseUrl);
  }

  async saveSchema(pageKey: string, schema: Record<string, any> | null) {
    return this.prisma.pageMeta.upsert({
      where: { pageKey },
      update: { schema: schema as any },
      create: { pageKey, schema: schema as any },
    });
  }
}