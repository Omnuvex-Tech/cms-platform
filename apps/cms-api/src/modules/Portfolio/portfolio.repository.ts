import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreatePortfolioSettingsDto } from './dto/create-portfolio-settings.dto';
import { UpdatePortfolioSettingsDto } from './dto/update-portfolio-settings.dto';

const PORTFOLIO_INCLUDE = {
  services: { include: { service: true } },
};

@Injectable()
export class PortfolioRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.portfolio.findMany({
      orderBy: { order: 'asc' },
      include: PORTFOLIO_INCLUDE,
    });
  }

  findAllVisible() {
    return this.prisma.portfolio.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
      include: PORTFOLIO_INCLUDE,
    });
  }

  findHomepage() {
    return this.prisma.portfolio.findMany({
      where: { isHomepage: true, isVisible: true },
      orderBy: { order: 'asc' },
      take: 6,
      include: PORTFOLIO_INCLUDE,
    });
  }

  getPortfolioSettings() {
    return this.prisma.portfolioSettings.findFirst();
  }

  createPortfolioSettings(dto: CreatePortfolioSettingsDto) {
    return this.prisma.portfolioSettings.create({
      data: dto,
    });
  }

  updatePortfolioSettings(id: number, dto: UpdatePortfolioSettingsDto) {
    return this.prisma.portfolioSettings.update({
      where: { id },
      data: dto,
    });
  }

  toggleHomepage(id: number, isHomepage: boolean) {
    return this.prisma.portfolio.update({ where: { id }, data: { isHomepage } });
  }

  findOne(id: number) {
    return this.prisma.portfolio.findUnique({
      where: { id },
      include: PORTFOLIO_INCLUDE,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.portfolio.findUnique({
      where: { slug },
      include: PORTFOLIO_INCLUDE,
    });
  }

  create(dto: CreatePortfolioDto) {
    const { categories, ...rest } = dto;
    return this.prisma.portfolio.create({
      data: {
        ...rest,
        sections: dto.sections ?? [],
        services: {
          create: categories.map((c) => ({
            serviceId: c.serviceId,
            coverImage: c.coverImage,
            coverImageAlt: c.coverImageAlt ?? {},
          })),
        },
      },
      include: PORTFOLIO_INCLUDE,
    });
  }

  update(id: number, dto: UpdatePortfolioDto) {
    const { schema, categories, ...rest } = dto;
    return this.prisma.portfolio.update({
      where: { id },
      data: {
        ...rest,
        ...(schema !== undefined && {
          schema: schema === null ? Prisma.JsonNull : schema,
        }),
        ...(categories !== undefined && {
          services: {
            deleteMany: {},
            create: categories.map((c) => ({
              serviceId: c.serviceId,
              coverImage: c.coverImage,
              coverImageAlt: c.coverImageAlt ?? {},
            })),
          },
        }),
      },
      include: PORTFOLIO_INCLUDE,
    });
  }

  saveSchema(id: number, schema: Record<string, any> | null) {
    return this.prisma.portfolio.update({
      where: { id },
      data: { schema: schema === null ? Prisma.JsonNull : schema },
    });
  }

  toggleVisibility(id: number, isVisible: boolean) {
    return this.prisma.portfolio.update({ where: { id }, data: { isVisible } });
  }

  delete(id: number) {
    return this.prisma.portfolio.delete({ where: { id } });
  }

  async reorder(ids: number[]) {
    const updates = ids.map((id, index) =>
      this.prisma.portfolio.update({
        where: { id },
        data: { order: index },
      })
    );
    return this.prisma.$transaction(updates);
  }
}