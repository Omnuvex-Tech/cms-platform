import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreatePortfolioSettingsDto } from './dto/create-portfolio-settings.dto';
import { UpdatePortfolioSettingsDto } from './dto/update-portfolio-settings.dto';


@Injectable()
export class PortfolioRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.portfolio.findMany({
      orderBy: { order: 'asc' },
    });
  }

  findAllVisible() {
    return this.prisma.portfolio.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });
  }
findHomepage() {
  return this.prisma.portfolio.findMany({
    where: { isHomepage: true, isVisible: true },
    orderBy: { order: 'asc' },
    take: 6, 
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

updatePortfolioSettings(
  id: number,
  dto: UpdatePortfolioSettingsDto,
) {
  return this.prisma.portfolioSettings.update({
    where: { id },
    data: dto,
  });
}

toggleHomepage(id: number, isHomepage: boolean) {
  return this.prisma.portfolio.update({ where: { id }, data: { isHomepage } });
}


  findOne(id: number) {
    return this.prisma.portfolio.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.portfolio.findUnique({ where: { slug } });
  }

  create(dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        ...dto,
        sections: dto.sections ?? [],
      },
    });
  }

  update(id: number, dto: UpdatePortfolioDto) {
    return this.prisma.portfolio.update({ where: { id }, data: dto });
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