import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLayihelerimizDto } from './dto/create-layihelerimiz.dto';
import { UpdateLayihelerimizDto } from './dto/update-layihelerimiz.dto';

@Injectable()
export class LayihelerimizRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.layihelerimizCategory.findMany({
      orderBy: { order: 'asc' },
    });
  }

  findVisible() {
    return this.prisma.layihelerimizCategory.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.layihelerimizCategory.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.layihelerimizCategory.findUnique({ where: { slug } });
  }

  create(data: CreateLayihelerimizDto & { slug: string }) {
    return this.prisma.layihelerimizCategory.create({ data });
  }

  update(id: string, data: UpdateLayihelerimizDto) {
    return this.prisma.layihelerimizCategory.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.layihelerimizCategory.delete({ where: { id } });
  }

  findDetailBySlug(slug: string) {
    return this.prisma.layihelerimizProjectDetail.findUnique({
      where: { categorySlug: slug },
    });
  }

  /**
   * Layihənin kartını və (varsa) detal sətrini yeni slug altında köçürür.
   *
   * Hər ikisi bir tranzaksiyadadır: yarımçıq nüsxə (kart var, blokları yoxdur)
   * qalmasın. Nüsxə orijinalın düz ardınca dayansın deyə ondan sonrakı bütün
   * `order` dəyərləri bir addım sürüşdürülür.
   *
   * Şəkil yolları olduğu kimi köçürülür — fayllar `uploads` qovluğunda qalır və
   * silinmə əməliyyatı faylı silmədiyi üçün iki layihənin eyni fayla baxması
   * təhlükəsizdir.
   */
  duplicate(params: {
    category: Record<string, any>;
    detail: Record<string, any> | null;
    slug: string;
    title: any;
  }) {
    const { category, detail, slug, title } = params;
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      slug: _slug,
      title: _title,
      order: sourceOrder,
      ...categoryRest
    } = category;

    return this.prisma.$transaction(async (tx) => {
      await tx.layihelerimizCategory.updateMany({
        where: { order: { gt: sourceOrder } },
        data: { order: { increment: 1 } },
      });

      const created = await tx.layihelerimizCategory.create({
        data: {
          ...categoryRest,
          slug,
          title,
          order: sourceOrder + 1,
          // Nüsxə saytda dərhal görünməsin — admin adını və məzmununu
          // dəyişdikdən sonra özü açır.
          isVisible: false,
        },
      });

      if (detail) {
        const {
          id: _detailId,
          createdAt: _detailCreatedAt,
          updatedAt: _detailUpdatedAt,
          categorySlug: _categorySlug,
          ...detailRest
        } = detail;

        // `null` dəyərlər atılır: Prisma nullable Json sütununa birbaşa `null`
        // qəbul etmir (DbNull/JsonNull tələb edir), boş buraxılanda isə sütun
        // onsuz da null qalır.
        const detailData = Object.fromEntries(
          Object.entries(detailRest).filter(([, value]) => value !== null),
        );

        await tx.layihelerimizProjectDetail.create({
          data: { ...detailData, categorySlug: slug },
        });
      }

      return created;
    });
  }

  /** Verilən id sırasını order sütununa yazır (master-dəki reorder ilə eyni). */
  reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.layihelerimizCategory.update({
        where: { id },
        data: { order: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
